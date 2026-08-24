<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Process;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Tests\TestCase;
use ZipArchive;

class PdfImageExtractorTest extends TestCase
{
    use RefreshDatabase;

    public function test_extracts_the_embedded_jpeg_and_returns_it_zipped(): void
    {
        $user = User::factory()->create();

        $image = imagecreatetruecolor(40, 30);
        imagefill($image, 0, 0, imagecolorallocate($image, 200, 60, 60));
        ob_start();
        imagejpeg($image, null, 90);
        $jpeg = ob_get_clean();
        imagedestroy($image);

        $response = $this->actingAs($user)->post(route('pdf-image-extractor.store'), [
            'pdf' => UploadedFile::fake()->createWithContent('sample.pdf', $this->assemblePdf($jpeg)),
            'mode' => 'extract',
        ]);

        $response->assertOk();

        /** @var BinaryFileResponse $baseResponse */
        $baseResponse = $response->baseResponse;
        $this->assertStringContainsString('extracted-images.zip', (string) $baseResponse->headers->get('content-disposition'));

        $zipPath = $baseResponse->getFile()->getPathname();

        $zip = new ZipArchive;
        $this->assertTrue($zip->open($zipPath));
        $this->assertSame(1, $zip->numFiles);

        $imageName = $zip->getNameIndex(0);
        $this->assertStringEndsWith('.jpg', $imageName);
        $extracted = $zip->getFromName($imageName);
        $zip->close();

        $info = getimagesizefromstring($extracted);
        $this->assertNotFalse($info);
        $this->assertSame(IMAGETYPE_JPEG, $info[2]);
        $this->assertSame(40, $info[0]);
        $this->assertSame(30, $info[1]);

        File::deleteDirectory(dirname($zipPath));
    }

    public function test_extracts_an_image_whose_dictionary_omits_the_type_xobject_key(): void
    {
        // Real-world regression: some PDF generators embed images with only
        // /Subtype /Image and no /Type /XObject key. That's enough for the
        // PDF imaging model, but pdfparser's getObjectsByType('XObject', ...)
        // requires /Type to be present — so extraction has to look up images
        // by /Subtype directly rather than relying on that helper.
        $user = User::factory()->create();

        $image = imagecreatetruecolor(20, 15);
        imagefill($image, 0, 0, imagecolorallocate($image, 10, 200, 90));
        ob_start();
        imagejpeg($image, null, 90);
        $jpeg = ob_get_clean();
        imagedestroy($image);

        $response = $this->actingAs($user)->post(route('pdf-image-extractor.store'), [
            'pdf' => UploadedFile::fake()->createWithContent('sample.pdf', $this->assemblePdf($jpeg, includeXObjectType: false)),
            'mode' => 'extract',
        ]);

        $response->assertOk();

        /** @var BinaryFileResponse $baseResponse */
        $baseResponse = $response->baseResponse;
        $zipPath = $baseResponse->getFile()->getPathname();

        $zip = new ZipArchive;
        $this->assertTrue($zip->open($zipPath));
        $this->assertSame(1, $zip->numFiles);
        $zip->close();

        File::deleteDirectory(dirname($zipPath));
    }

    public function test_pages_mode_renders_one_jpg_per_page(): void
    {
        if (! trim((string) shell_exec('command -v pdftoppm'))) {
            $this->markTestSkipped('poppler-utils (pdftoppm) is not installed.');
        }

        $user = User::factory()->create();

        // Two pages, neither of which needs to contain an actual image —
        // pages mode rasterizes the page itself, not embedded image objects.
        $pdf = $this->assembleMultiPagePdf(2);

        $response = $this->actingAs($user)->post(route('pdf-image-extractor.store'), [
            'pdf' => UploadedFile::fake()->createWithContent('sample.pdf', $pdf),
            'mode' => 'pages',
        ]);

        $response->assertOk();

        /** @var BinaryFileResponse $baseResponse */
        $baseResponse = $response->baseResponse;
        $zipPath = $baseResponse->getFile()->getPathname();

        $zip = new ZipArchive;
        $this->assertTrue($zip->open($zipPath));
        $this->assertSame(2, $zip->numFiles);
        $this->assertSame('sample-001.jpg', $zip->getNameIndex(0));
        $this->assertSame('sample-002.jpg', $zip->getNameIndex(1));

        $page = $zip->getFromName('sample-001.jpg');
        $zip->close();

        $info = getimagesizefromstring($page);
        $this->assertNotFalse($info);
        $this->assertSame(IMAGETYPE_JPEG, $info[2]);

        File::deleteDirectory(dirname($zipPath));
    }

    public function test_pages_mode_is_the_default_when_mode_is_omitted(): void
    {
        if (! trim((string) shell_exec('command -v pdftoppm'))) {
            $this->markTestSkipped('poppler-utils (pdftoppm) is not installed.');
        }

        $user = User::factory()->create();

        $response = $this->actingAs($user)->post(route('pdf-image-extractor.store'), [
            'pdf' => UploadedFile::fake()->createWithContent('sample.pdf', $this->assembleMultiPagePdf(2)),
        ]);

        $response->assertOk();

        /** @var BinaryFileResponse $baseResponse */
        $baseResponse = $response->baseResponse;
        $zipPath = $baseResponse->getFile()->getPathname();

        $zip = new ZipArchive;
        $this->assertTrue($zip->open($zipPath));
        $this->assertSame(2, $zip->numFiles);
        $zip->close();

        File::deleteDirectory(dirname($zipPath));
    }

    public function test_extracted_files_are_named_after_the_uploaded_pdf(): void
    {
        $user = User::factory()->create();

        $image = imagecreatetruecolor(20, 15);
        imagefill($image, 0, 0, imagecolorallocate($image, 30, 90, 200));
        ob_start();
        imagejpeg($image, null, 90);
        $jpeg = ob_get_clean();
        imagedestroy($image);

        // Characters that aren't filename-safe (here "?!") must be sanitized
        // rather than passed straight into the zip entry name.
        $response = $this->actingAs($user)->post(route('pdf-image-extractor.store'), [
            'pdf' => UploadedFile::fake()->createWithContent('Q1 Report?!.pdf', $this->assemblePdf($jpeg)),
            'mode' => 'extract',
        ]);

        $response->assertOk();

        /** @var BinaryFileResponse $baseResponse */
        $baseResponse = $response->baseResponse;
        $zipPath = $baseResponse->getFile()->getPathname();

        $zip = new ZipArchive;
        $this->assertTrue($zip->open($zipPath));
        $this->assertSame('Q1 Report-001.jpg', $zip->getNameIndex(0));
        $zip->close();

        File::deleteDirectory(dirname($zipPath));
    }

    public function test_pages_mode_fails_cleanly_when_the_renderer_is_unavailable(): void
    {
        Process::fake([
            '*pdftoppm*' => Process::result(output: '', errorOutput: 'pdftoppm: command not found', exitCode: 127),
        ]);

        $user = User::factory()->create();

        $image = imagecreatetruecolor(10, 10);
        ob_start();
        imagejpeg($image);
        $jpeg = ob_get_clean();
        imagedestroy($image);

        $response = $this->actingAs($user)->post(route('pdf-image-extractor.store'), [
            'pdf' => UploadedFile::fake()->createWithContent('sample.pdf', $this->assemblePdf($jpeg)),
            'mode' => 'pages',
        ]);

        $response->assertStatus(422);
        $response->assertJson(['message' => 'Could not read this PDF. Make sure it is not corrupted or password-protected.']);
    }

    public function test_returns_a_friendly_error_when_the_pdf_has_no_images(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post(route('pdf-image-extractor.store'), [
            'pdf' => UploadedFile::fake()->createWithContent('empty.pdf', $this->assemblePdf(null)),
            'mode' => 'extract',
        ]);

        $response->assertStatus(422);
        $response->assertJson(['message' => 'No embedded JPG/PNG images were found in this PDF.']);
    }

    public function test_rejects_a_non_pdf_upload(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post(route('pdf-image-extractor.store'), [
            'pdf' => UploadedFile::fake()->create('not-a-pdf.txt', 10, 'text/plain'),
        ]);

        $response->assertSessionHasErrors('pdf');
    }

    /**
     * Hand-assembles a minimal, syntactically valid PDF (proper objects, xref
     * table and trailer) with a single-page Resources dict that embeds a
     * DCTDecode (JPEG) image XObject — or, when $jpeg is null, a page with no
     * images at all.
     */
    private function assemblePdf(?string $jpeg, bool $includeXObjectType = true): string
    {
        $bodies = [];
        $bodies[] = '<< /Type /Catalog /Pages 2 0 R >>';
        $bodies[] = '<< /Type /Pages /Kids [3 0 R] /Count 1 >>';

        if ($jpeg !== null) {
            $typeKey = $includeXObjectType ? '/Type /XObject ' : '';
            $bodies[] = '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 100 100] /Resources << /XObject << /Im1 4 0 R >> >> /Contents 5 0 R >>';
            $bodies[] = "<< {$typeKey}/Subtype /Image /Width 40 /Height 30 /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ".strlen($jpeg)." >>\nstream\n{$jpeg}\nendstream";
            $bodies[] = "<< /Length 0 >>\nstream\n\nendstream";
        } else {
            $bodies[] = '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 100 100] /Resources << >> /Contents 4 0 R >>';
            $bodies[] = "<< /Length 0 >>\nstream\n\nendstream";
        }

        $pdf = "%PDF-1.4\n";
        $offsets = [];
        foreach ($bodies as $i => $body) {
            $num = $i + 1;
            $offsets[$num] = strlen($pdf);
            $pdf .= "{$num} 0 obj\n{$body}\nendobj\n";
        }

        $count = count($bodies) + 1;
        $xrefOffset = strlen($pdf);
        $pdf .= "xref\n0 {$count}\n";
        $pdf .= "0000000000 65535 f \n";
        for ($num = 1; $num < $count; $num++) {
            $pdf .= sprintf("%010d %05d n \n", $offsets[$num], 0);
        }
        $pdf .= "trailer\n<< /Size {$count} /Root 1 0 R >>\nstartxref\n{$xrefOffset}\n%%EOF";

        return $pdf;
    }

    /**
     * Hand-assembles a minimal, valid multi-page PDF. Each page just draws a
     * filled rectangle (no font resource needed) — pages mode rasterizes the
     * page itself, so it doesn't need an embedded image to test against.
     */
    private function assembleMultiPagePdf(int $pageCount): string
    {
        $bodies = [];
        $kids = [];
        for ($i = 0; $i < $pageCount; $i++) {
            $kids[] = (3 + $i).' 0 R';
        }

        $bodies[] = '<< /Type /Catalog /Pages 2 0 R >>';
        $bodies[] = '<< /Type /Pages /Kids ['.implode(' ', $kids).'] /Count '.$pageCount.' >>';

        for ($i = 0; $i < $pageCount; $i++) {
            $contentObjNum = 3 + $pageCount + $i;
            $bodies[] = "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 200 200] /Resources << >> /Contents {$contentObjNum} 0 R >>";
        }

        $content = '10 10 180 180 re f';
        for ($i = 0; $i < $pageCount; $i++) {
            $bodies[] = '<< /Length '.strlen($content)." >>\nstream\n{$content}\nendstream";
        }

        $pdf = "%PDF-1.4\n";
        $offsets = [];
        foreach ($bodies as $i => $body) {
            $num = $i + 1;
            $offsets[$num] = strlen($pdf);
            $pdf .= "{$num} 0 obj\n{$body}\nendobj\n";
        }

        $count = count($bodies) + 1;
        $xrefOffset = strlen($pdf);
        $pdf .= "xref\n0 {$count}\n";
        $pdf .= "0000000000 65535 f \n";
        for ($num = 1; $num < $count; $num++) {
            $pdf .= sprintf("%010d %05d n \n", $offsets[$num], 0);
        }
        $pdf .= "trailer\n<< /Size {$count} /Root 1 0 R >>\nstartxref\n{$xrefOffset}\n%%EOF";

        return $pdf;
    }
}
