<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Process;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;
use ZipArchive;

class BuildWhitelabelPackageTest extends TestCase
{
    public function test_it_builds_and_publishes_the_whitelabel_source_as_a_zip(): void
    {
        Process::fake();
        Storage::fake('local');

        $this->artisan('whitelabel:build')->assertExitCode(0);

        Process::assertRan('npm install');
        Process::assertRan('npm run build');
        Storage::disk('local')->assertExists('whitelabel/karanglabs-whitelabel.zip');

        $zip = new ZipArchive;
        $zip->open(Storage::disk('local')->path('whitelabel/karanglabs-whitelabel.zip'));

        $this->assertNotFalse($zip->locateName('src/config.js'), 'Package must contain the editable source, not just a build.');
        $this->assertNotFalse($zip->locateName('package.json'));
        $this->assertNotFalse($zip->locateName('google-apps-script/Code.gs'));

        for ($i = 0; $i < $zip->numFiles; $i++) {
            $name = $zip->getNameIndex($i);
            $this->assertStringStartsNotWith('node_modules/', $name);
            $this->assertStringStartsNotWith('dist/', $name);
        }

        $zip->close();
    }

    public function test_it_fails_and_publishes_nothing_when_npm_install_fails(): void
    {
        Process::fake([
            'npm install' => Process::result(errorOutput: 'npm install boom', exitCode: 1),
        ]);
        Storage::fake('local');

        $this->artisan('whitelabel:build')->assertExitCode(1);

        Process::assertNotRan('npm run build');
        Storage::disk('local')->assertMissing('whitelabel/karanglabs-whitelabel.zip');
    }

    public function test_it_fails_and_publishes_nothing_when_the_build_fails(): void
    {
        Process::fake([
            'npm install' => Process::result(),
            'npm run build' => Process::result(errorOutput: 'build broke', exitCode: 1),
        ]);
        Storage::fake('local');

        $this->artisan('whitelabel:build')->assertExitCode(1);

        Storage::disk('local')->assertMissing('whitelabel/karanglabs-whitelabel.zip');
    }
}
