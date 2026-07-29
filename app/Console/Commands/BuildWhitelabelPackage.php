<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Process;
use Illuminate\Support\Facades\Storage;
use RecursiveDirectoryIterator;
use RecursiveIteratorIterator;
use ZipArchive;

#[Signature('whitelabel:build')]
#[Description('Verify the whitelabel/ source builds cleanly, then publish its source code as the downloadable reseller package (RESELLER_PACKAGE_PATH).')]
class BuildWhitelabelPackage extends Command
{
    private const STORAGE_PATH = 'whitelabel/karanglabs-whitelabel.zip';

    /** Top-level directories under whitelabel/ excluded from the shipped source zip. */
    private const EXCLUDED_DIRS = ['node_modules', 'dist'];

    public function handle(): int
    {
        $whitelabelDir = base_path('whitelabel');

        if (! is_dir($whitelabelDir)) {
            $this->error("whitelabel/ directory not found at {$whitelabelDir}");

            return self::FAILURE;
        }

        $this->info('Installing whitelabel dependencies...');
        $install = Process::path($whitelabelDir)->timeout(300)->run('npm install');

        if ($install->failed()) {
            $this->error($install->errorOutput());

            return self::FAILURE;
        }

        $this->info('Verifying whitelabel builds cleanly...');
        $build = Process::path($whitelabelDir)->timeout(300)->run('npm run build');

        if ($build->failed()) {
            $this->error($build->errorOutput());

            return self::FAILURE;
        }

        $this->info('Zipping source code (buyers rebrand config.js and build it themselves)...');
        $zipPath = tempnam(sys_get_temp_dir(), 'whitelabel').'.zip';

        if (! $this->zipDirectory($whitelabelDir, $zipPath)) {
            $this->error('Could not create zip archive.');

            return self::FAILURE;
        }

        Storage::put(self::STORAGE_PATH, file_get_contents($zipPath));
        unlink($zipPath);

        $this->info('Published to storage: '.self::STORAGE_PATH);
        $this->line('Make sure RESELLER_PACKAGE_PATH="'.self::STORAGE_PATH.'" is set in .env.');

        return self::SUCCESS;
    }

    private function zipDirectory(string $sourceDir, string $zipPath): bool
    {
        $zip = new ZipArchive;

        if ($zip->open($zipPath, ZipArchive::CREATE) !== true) {
            return false;
        }

        $files = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($sourceDir, RecursiveDirectoryIterator::SKIP_DOTS),
            RecursiveIteratorIterator::LEAVES_ONLY,
        );

        foreach ($files as $file) {
            $relativePath = substr($file->getPathname(), strlen($sourceDir) + 1);
            $topLevelDir = explode(DIRECTORY_SEPARATOR, $relativePath)[0];

            if (in_array($topLevelDir, self::EXCLUDED_DIRS, true) || basename($relativePath) === '.DS_Store') {
                continue;
            }

            $zip->addFile($file->getPathname(), $relativePath);
        }

        $zip->close();

        return true;
    }
}
