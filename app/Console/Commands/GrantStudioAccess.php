<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('studio:grant {email : The email of the buyer to grant Studio access to} {--revoke : Revoke access instead of granting it}')]
#[Description('Grant (or revoke) Karanglabs Studio access for a purchased user.')]
class GrantStudioAccess extends Command
{
    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $email = $this->argument('email');
        $revoke = (bool) $this->option('revoke');

        $user = User::where('email', $email)->first();

        if (! $user) {
            $this->error("No user found with email {$email}.");

            return self::FAILURE;
        }

        $user->forceFill([
            'has_studio_access' => ! $revoke,
            'studio_access_granted_at' => $revoke ? null : now(),
        ])->save();

        $this->info($revoke
            ? "Studio access revoked for {$email}."
            : "Studio access granted to {$email}.");

        return self::SUCCESS;
    }
}
