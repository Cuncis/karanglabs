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
#[Description('Build the whitelabel/ static app and publish it as the downloadable reseller package (RESELLER_PACKAGE_PATH).')]
class BuildWhitelabelPackage extends Command
{
    private const STORAGE_PATH = 'whitelabel/karanglabs-whitelabel.zip';

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

        $this->info('Building whitelabel static site...');
        $build = Process::path($whitelabelDir)->timeout(300)->run('npm run build');

        if ($build->failed()) {
            $this->error($build->errorOutput());

            return self::FAILURE;
        }

        $distDir = "{$whitelabelDir}/dist";

        if (! is_dir($distDir)) {
            $this->error("Build succeeded but dist/ was not found at {$distDir}");

            return self::FAILURE;
        }

        $this->info('Zipping dist/...');
        $zipPath = tempnam(sys_get_temp_dir(), 'whitelabel').'.zip';

        if (! $this->zipDirectory($distDir, $zipPath)) {
            $this->error('Could not create zip archive.');

            return self::FAILURE;
        }

        Storage::put(self::STORAGE_PATH, file_get_contents($zipPath));
        unlink($zipPath);

        $this->info('Published to storage: '.self::STORAGE_PATH);
        $this->line('Make sure RESELLER_PACKAGE_PATH="'.self::STORAGE_PATH.'" is set in .env.');

        return self::SUCCESS;
    }

    private function zipDirectory(string $distDir, string $zipPath): bool
    {
        $zip = new ZipArchive;

        if ($zip->open($zipPath, ZipArchive::CREATE) !== true) {
            return false;
        }

        $files = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($distDir, RecursiveDirectoryIterator::SKIP_DOTS),
            RecursiveIteratorIterator::LEAVES_ONLY,
        );

        foreach ($files as $file) {
            $relativePath = substr($file->getPathname(), strlen($distDir) + 1);
            $zip->addFile($file->getPathname(), $relativePath);
        }

        $zip->close();

        return true;
    }
}
