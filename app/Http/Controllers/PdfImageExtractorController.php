<?php

namespace App\Http\Controllers;

use GdImage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
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
     * Nothing here touches the database — the PDF, extracted images, and zip
     * all live in a per-request temp directory that's deleted once the
     * response has been sent.
     */
    public function __invoke(Request $request): BinaryFileResponse|JsonResponse
    {
        $request->validate([
            'pdf' => ['required', 'file', 'mimes:pdf', 'max:30720'],
        ]);

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
            $request->file('pdf')->move($workDir, 'source.pdf');

            $images = $this->extractImages($pdfPath, $workDir);

            if ($images === []) {
                return response()->json([
                    'message' => 'No embedded JPG/PNG images were found in this PDF.',
                ], 422);
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
     * @return list<array{path: string, name: string}>
     */
    private function extractImages(string $pdfPath, string $workDir): array
    {
        $document = (new Parser)->parseFile($pdfPath);
        $objects = $document->getObjectsByType('XObject', 'Image');

        $saved = [];
        $index = 0;

        foreach ($objects as $object) {
            $bytes = $this->rasterize($object);
            if ($bytes === null) {
                continue;
            }

            $info = @getimagesizefromstring($bytes);
            if ($info === false || ! in_array($info['mime'], ['image/jpeg', 'image/png'], true)) {
                continue;
            }

            $index++;
            $extension = $info['mime'] === 'image/png' ? 'png' : 'jpg';
            $filename = sprintf('image-%03d.%s', $index, $extension);
            $path = $workDir.'/'.$filename;

            file_put_contents($path, $this->compress($bytes, $info['mime']));
            $saved[] = ['path' => $path, 'name' => $filename];
        }

        return $saved;
    }

    /**
     * Turn a PDF image XObject into standalone JPEG/PNG bytes, or null if it
     * can't be reconstructed.
     *
     * A DCTDecode-filtered stream already *is* a raw JPEG file, so that's a
     * straight passthrough — this is how the vast majority of photos end up
     * embedded in a PDF. Anything filtered with FlateDecode/LZW/etc. is just
     * raw pixel samples with no file header at all, so it's rebuilt by hand
     * from Width/Height/ColorSpace/BitsPerComponent — only the common 8-bit
     * DeviceGray/DeviceRGB and 1-bit DeviceGray cases are supported.
     * Encodings with no available decoder (CCITT fax, JBIG2, JPEG2000) are
     * skipped rather than misread as raw samples.
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

        if (str_starts_with($content, "\x89PNG\r\n\x1a\n")) {
            return $content;
        }

        if (! $this->hasDecodableFilter($object)) {
            return null;
        }

        return $this->rebuildRaster($object, $content);
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

    private function rebuildRaster(PDFObject $object, string $samples): ?string
    {
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

        ob_start();
        imagepng($image, null, 9);
        $png = ob_get_clean();
        imagedestroy($image);

        return $png !== false && $png !== '' ? $png : null;
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
     * Re-encode at a size-conscious setting with no visible quality loss.
     * Never keep a "compressed" result that's bigger than what came in.
     */
    private function compress(string $bytes, string $mime): string
    {
        $image = @imagecreatefromstring($bytes);
        if ($image === false) {
            return $bytes;
        }

        ob_start();
        if ($mime === 'image/jpeg') {
            imagejpeg($image, null, self::JPEG_QUALITY);
        } else {
            imagesavealpha($image, true);
            imagepng($image, null, 9);
        }
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
