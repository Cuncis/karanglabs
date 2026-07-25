<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Fillable(['name', 'email', 'password', 'job_background', 'has_studio_access', 'studio_access_granted_at'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

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
     * Whether this user is an owner/admin (email listed in ADMIN_EMAILS).
     */
    public function isAdmin(): bool
    {
        return in_array($this->email, config('studio.admin_emails', []), true);
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
