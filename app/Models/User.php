<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Fillable(['name', 'email', 'password', 'job_background', 'has_studio_access', 'studio_access_granted_at', 'role', 'license_key'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The three login levels, lowest to highest.
     */
    public const ROLE_MEMBER = 'member';

    public const ROLE_RESELLER = 'reseller';

    public const ROLE_ADMIN = 'admin';

    /**
     * Rank per role, used for "at least this level" comparisons.
     */
    private const ROLE_LEVELS = [
        self::ROLE_MEMBER => 1,
        self::ROLE_RESELLER => 2,
        self::ROLE_ADMIN => 3,
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'has_studio_access' => 'boolean',
            'studio_access_granted_at' => 'datetime',
        ];
    }

    /**
     * Whether the user has purchased and been granted Studio access.
     */
    public function hasStudioAccess(): bool
    {
        return (bool) $this->has_studio_access;
    }

    /**
     * Whether this user is an owner/admin. True for the `admin` role, or for any
     * email listed in ADMIN_EMAILS (bootstrap override for the owner).
     */
    public function isAdmin(): bool
    {
        return $this->role === self::ROLE_ADMIN
            || in_array($this->email, config('studio.admin_emails', []), true);
    }

    /**
     * Whether this user holds a whitelabel reseller license.
     */
    public function isReseller(): bool
    {
        return $this->role === self::ROLE_RESELLER;
    }

    /**
     * Whether the user is at least the given role level.
     */
    public function hasRoleLevel(string $role): bool
    {
        $current = $this->isAdmin() ? self::ROLE_ADMIN : ($this->role ?? self::ROLE_MEMBER);

        return (self::ROLE_LEVELS[$current] ?? 0) >= (self::ROLE_LEVELS[$role] ?? 99);
    }

    /**
     * Human-friendly label for the user's level.
     */
    public function roleLabel(): string
    {
        return match (true) {
            $this->isAdmin() => 'Admin',
            $this->isReseller() => 'Reseller',
            default => 'Member',
        };
    }

    public function terminalSnippets()
    {
        return $this->hasMany(TerminalSnippet::class);
    }

    public function studioProjects()
    {
        return $this->hasMany(StudioProject::class);
    }
}
