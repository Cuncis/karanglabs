<?php

namespace App\Http\Controllers;

use GdImage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Process;
use Illuminate\Support\Str;
use RuntimeException;
use Smalot\PdfParser\Element\ElementArray;
use Smalot\PdfParser\Parser;
use Smalot\PdfParser\PDFObject;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Throwable;
use ZipArchive;

class PdfImageExtractorController extends Controller
{
    /**
     * JPEGs are re-encoded at this quality — visually lossless, and well
     * above the "never drop below 70%" floor the user asked for.
     */
    private const JPEG_QUALITY = 82;

    /**
     * Image codecs PdfParser can't decode. A stream using one of these isn't
     * raw pixel samples, so it must never be fed to the raster rebuilder.
     */
    private const UNSUPPORTED_FILTERS = ['DCTDecode', 'CCITTFaxDecode', 'JBIG2Decode', 'JPXDecode'];

    /**
     * Screen-quality resolution for whole-page rendering. 120 DPI was tried
     * first for a smaller file but visibly blurred small text and diagram
     * labels; 150 DPI keeps those legible while optimize/progressive JPEG
     * encoding (see renderPages()) still keeps the file smaller than a naive
     * 150 DPI render would.
     */
    private const PAGE_RENDER_DPI = 150;

    /**
     * Full-page renders can afford to sit closer to the 70% floor than
     * individual extracted photos — a whole page rendered at high quality is
     * still large, and the visual difference at this level is negligible.
     */
    private const PAGE_RENDER_QUALITY = 75;

    /**
     * Nothing here touches the database — the PDF, extracted/rendered images,
     * and zip all live in a per-request temp directory that's deleted once
     * the response has been sent.
     */
    public function __invoke(Request $request): BinaryFileResponse|JsonResponse
    {
        $validated = $request->validate([
            'pdf' => ['required', 'file', 'mimes:pdf', 'max:30720'],
            'mode' => ['nullable', 'string', 'in:extract,pages'],
        ]);
        $mode = $validated['mode'] ?? 'pages';

        $workDir = storage_path('app/pdf-extractor/'.Str::uuid());
        File::ensureDirectoryExists($workDir);

        // A shutdown function — not app()->terminating() — because it must run
        // after the zip has actually been streamed to the client. Laravel's
        // terminate() hook fires as soon as the response object exists, which
        // for a file download is before send() has streamed anything. It also
        // has to skip the File facade: by true process shutdown the container
        // may already be torn down.
        register_shutdown_function(static function () use ($workDir) {
            foreach (glob($workDir.'/*') ?: [] as $path) {
                @unlink($path);
            }
            @rmdir($workDir);
        });

        try {
            $pdfPath = $workDir.'/source.pdf';
            $baseName = $this->baseFilename($request->file('pdf')->getClientOriginalName());
            $request->file('pdf')->move($workDir, 'source.pdf');

            $images = $mode === 'pages'
                ? $this->renderPages($pdfPath, $workDir, $baseName)
                : $this->extractImages($pdfPath, $workDir, $baseName);

            if ($images === []) {
                $message = $mode === 'pages'
                    ? 'Could not render any pages from this PDF.'
                    : 'No embedded JPG/PNG images were found in this PDF.';

                return response()->json(['message' => $message], 422);
            }

            $zipPath = $workDir.'/extracted-images.zip';
            $this->zip($images, $zipPath);

            File::delete($pdfPath);
            foreach ($images as $image) {
                File::delete($image['path']);
            }

            return response()
                ->download($zipPath, 'extracted-images.zip')
                ->deleteFileAfterSend(true);
        } catch (Throwable $e) {
            report($e);

            return response()->json([
                'message' => 'Could not read this PDF. Make sure it is not corrupted or password-protected.',
            ], 422);
        }
    }

    /**
     * Render every page as its own JPG via Poppler's pdftoppm — a real page
     * rasterization (text, vector art, layout and all), unlike extractImages()
     * which only pulls out already-embedded photo objects. Requires the
     * poppler-utils package to be installed on the server.
     *
     * @return list<array{path: string, name: string}>
     */
    private function renderPages(string $pdfPath, string $workDir, string $baseName): array
    {
        $prefix = $workDir.'/render';

        $result = Process::timeout(120)->run([
            'pdftoppm',
            '-jpeg',
            '-jpegopt', 'quality='.self::PAGE_RENDER_QUALITY.',optimize=y,progressive=y',
            '-r', (string) self::PAGE_RENDER_DPI,
            $pdfPath,
            $prefix,
        ]);

        if ($result->failed()) {
            throw new RuntimeException('PDF page rendering is not available on this server: '.$result->errorOutput());
        }

        $rendered = glob($prefix.'-*.jpg') ?: [];
        natsort($rendered);

        $saved = [];
        $index = 0;

        foreach ($rendered as $path) {
            $index++;
            $filename = sprintf('%s-%03d.jpg', $baseName, $index);
            $target = $workDir.'/'.$filename;
            rename($path, $target);
            $saved[] = ['path' => $target, 'name' => $filename];
        }

        return $saved;
    }

    /**
     * Strip the .pdf extension and anything that isn't safe as a filename
     * (path separators, control characters, …) from the uploaded file's own
     * name, so extracted files are named after it instead of generically.
     */
    private function baseFilename(string $originalName): string
    {
        $name = pathinfo($originalName, PATHINFO_FILENAME);
        $name = preg_replace('/[^A-Za-z0-9 _-]+/', '-', $name) ?? '';
        $name = trim(preg_replace('/-+/', '-', $name) ?? '', '- ');

        return $name !== '' ? $name : 'pdf';
    }

    /**
     * @return list<array{path: string, name: string}>
     */
    private function extractImages(string $pdfPath, string $workDir, string $baseName): array
    {
        $document = (new Parser)->parseFile($pdfPath);

        // Not getObjectsByType('XObject', 'Image'): that requires an explicit
        // /Type /XObject key, which plenty of real-world PDF generators omit
        // on image objects even though /Subtype /Image is present (and is all
        // the PDF spec's imaging model actually needs to identify one).
        $objects = array_filter(
            $document->getObjects(),
            static fn ($object) => $object instanceof PDFObject
                && $object->has('Subtype')
                && $object->get('Subtype')->getContent() === 'Image'
        );

        // A soft mask (/SMask) is another image's alpha channel, not content
        // of its own — extracting it as a standalone "image" would just be a
        // meaningless grayscale silhouette, so skip anything referenced that
        // way.
        $maskObjectIds = [];
        foreach ($objects as $object) {
            if ($object->has('SMask')) {
                $maskObjectIds[spl_object_id($object->get('SMask'))] = true;
            }
        }

        $saved = [];
        $index = 0;

        foreach ($objects as $object) {
            if (isset($maskObjectIds[spl_object_id($object)])) {
                continue;
            }

            $jpeg = $this->rasterize($object);
            if ($jpeg === null || @getimagesizefromstring($jpeg) === false) {
                continue;
            }

            $index++;
            $filename = sprintf('%s-%03d.jpg', $baseName, $index);
            $path = $workDir.'/'.$filename;

            file_put_contents($path, $this->compress($jpeg));
            $saved[] = ['path' => $path, 'name' => $filename];
        }

        return $saved;
    }

    /**
     * Turn a PDF image XObject into standalone JPEG bytes, or null if it
     * can't be reconstructed. Every extracted image comes out as JPG, source
     * PNG/raw-sample images included, for one uniform output format.
     *
     * A DCTDecode-filtered stream already *is* a raw JPEG file, so that's a
     * straight passthrough — this is how the vast majority of photos end up
     * embedded in a PDF. A literal embedded PNG, or FlateDecode/LZW-encoded
     * raw pixel samples with no file header at all, gets decoded/rebuilt and
     * then re-encoded as JPEG. Raw-sample rebuilding only supports the common
     * 8-bit DeviceGray/DeviceRGB and 1-bit DeviceGray cases. Encodings with no
     * available decoder (CCITT fax, JBIG2, JPEG2000) are skipped rather than
     * misread as raw samples.
     */
    private function rasterize(PDFObject $object): ?string
    {
        try {
            $content = $object->getContent();
        } catch (Throwable) {
            return null;
        }

        if (! $content) {
            return null;
        }

        if (str_starts_with($content, "\xFF\xD8\xFF")) {
            return $content;
        }

        $image = str_starts_with($content, "\x89PNG\r\n\x1a\n")
            ? @imagecreatefromstring($content)
            : $this->rebuildRaster($object, $content);

        if ($image === false || $image === null) {
            return null;
        }

        ob_start();
        imagejpeg($image, null, self::JPEG_QUALITY);
        $jpeg = ob_get_clean();
        imagedestroy($image);

        return $jpeg !== false && $jpeg !== '' ? $jpeg : null;
    }

    private function hasDecodableFilter(PDFObject $object): bool
    {
        if (! $object->has('Filter')) {
            return true;
        }

        $filter = $object->get('Filter');
        $names = $filter instanceof ElementArray
            ? array_map(fn ($element) => (string) $element, $filter->getContent())
            : [(string) $filter];

        return array_intersect($names, self::UNSUPPORTED_FILTERS) === [];
    }

    private function rebuildRaster(PDFObject $object, string $samples): ?GdImage
    {
        if (! $this->hasDecodableFilter($object)) {
            return null;
        }

        $width = (int) $object->get('Width')->getContent();
        $height = (int) $object->get('Height')->getContent();
        $bitsPerComponent = $object->has('BitsPerComponent')
            ? (int) $object->get('BitsPerComponent')->getContent()
            : 8;
        $colorSpace = $object->has('ColorSpace') ? (string) $object->get('ColorSpace') : 'DeviceGray';

        // Guard against missing dimensions and large images. The reconstruction
        // below is a pure-PHP per-pixel loop (no fast raw-buffer blit exists in
        // GD without Imagick), so anything past a few megapixels risks running
        // past max_execution_time and truncating the response mid-stream —
        // skip it rather than let that happen.
        if ($width <= 0 || $height <= 0 || $width * $height > 4_000_000) {
            return null;
        }

        $image = imagecreatetruecolor($width, $height);
        if ($image === false) {
            return null;
        }

        $filled = match (true) {
            $bitsPerComponent === 8 && $colorSpace === 'DeviceRGB' => $this->fillRgb8($image, $samples, $width, $height),
            $bitsPerComponent === 8 && $colorSpace === 'DeviceGray' => $this->fillGray8($image, $samples, $width, $height),
            $bitsPerComponent === 1 && $colorSpace === 'DeviceGray' => $this->fillGray1($image, $samples, $width, $height),
            default => false,
        };

        if (! $filled) {
            imagedestroy($image);

            return null;
        }

        return $image;
    }

    private function fillRgb8(GdImage $image, string $samples, int $width, int $height): bool
    {
        $rowBytes = $width * 3;
        if (strlen($samples) < $rowBytes * $height) {
            return false;
        }

        for ($y = 0; $y < $height; $y++) {
            $rowOffset = $y * $rowBytes;
            for ($x = 0; $x < $width; $x++) {
                $p = $rowOffset + $x * 3;
                imagesetpixel($image, $x, $y, imagecolorallocate(
                    $image, ord($samples[$p]), ord($samples[$p + 1]), ord($samples[$p + 2])
                ));
            }
        }

        return true;
    }

    private function fillGray8(GdImage $image, string $samples, int $width, int $height): bool
    {
        if (strlen($samples) < $width * $height) {
            return false;
        }

        for ($y = 0; $y < $height; $y++) {
            $rowOffset = $y * $width;
            for ($x = 0; $x < $width; $x++) {
                $v = ord($samples[$rowOffset + $x]);
                imagesetpixel($image, $x, $y, imagecolorallocate($image, $v, $v, $v));
            }
        }

        return true;
    }

    private function fillGray1(GdImage $image, string $samples, int $width, int $height): bool
    {
        $rowBytes = (int) ceil($width / 8);
        if (strlen($samples) < $rowBytes * $height) {
            return false;
        }

        $black = imagecolorallocate($image, 0, 0, 0);
        $white = imagecolorallocate($image, 255, 255, 255);

        for ($y = 0; $y < $height; $y++) {
            $rowOffset = $y * $rowBytes;
            for ($x = 0; $x < $width; $x++) {
                $byte = ord($samples[$rowOffset + intdiv($x, 8)]);
                $bit = ($byte >> (7 - $x % 8)) & 1;
                imagesetpixel($image, $x, $y, $bit ? $white : $black);
            }
        }

        return true;
    }

    /**
     * Re-encode the JPEG at a size-conscious quality. Never keep a
     * "compressed" result that's bigger than what came in.
     */
    private function compress(string $bytes): string
    {
        $image = @imagecreatefromstring($bytes);
        if ($image === false) {
            return $bytes;
        }

        ob_start();
        imagejpeg($image, null, self::JPEG_QUALITY);
        $recompressed = ob_get_clean();
        imagedestroy($image);

        return (is_string($recompressed) && $recompressed !== '' && strlen($recompressed) < strlen($bytes))
            ? $recompressed
            : $bytes;
    }

    /**
     * @param  list<array{path: string, name: string}>  $images
     */
    private function zip(array $images, string $zipPath): void
    {
        $zip = new ZipArchive;
        $zip->open($zipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE);

        foreach ($images as $image) {
            $zip->addFile($image['path'], $image['name']);
        }

        $zip->close();
    }
}
