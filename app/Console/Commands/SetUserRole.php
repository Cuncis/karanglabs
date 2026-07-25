<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Services\StudioAccountService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('studio:role {email} {role : One of member|reseller|admin}')]
#[Description('Set a user login level: member, reseller, or admin.')]
class SetUserRole extends Command
{
    public function handle(StudioAccountService $accounts): int
    {
        $email = $this->argument('email');
        $role = strtolower($this->argument('role'));

        $allowed = [User::ROLE_MEMBER, User::ROLE_RESELLER, User::ROLE_ADMIN];

        if (! in_array($role, $allowed, true)) {
            $this->error('Role must be one of: '.implode(', ', $allowed));

            return self::FAILURE;
        }

        $user = User::where('email', $email)->first();

        if (! $user) {
            $this->error("No user found with email {$email}.");

            return self::FAILURE;
        }

        $accounts->assignRole($user, $role);

        $suffix = $role === User::ROLE_RESELLER && $user->license_key ? " License: {$user->license_key}" : '';
        $this->info("{$email} is now a {$role}.".$suffix);

        return self::SUCCESS;
    }
}
