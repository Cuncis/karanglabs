<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class StudioAccessMail extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * @param  User  $user  The buyer's account.
     * @param  ?string  $password  The generated password (null for an existing account).
     * @param  ?string  $licenseKey  The reseller license key (null for non-reseller buyers).
     * @param  ?string  $downloadUrl  The whitelabel download URL (null/empty until configured).
     */
    public function __construct(
        public User $user,
        public ?string $password = null,
        public ?string $licenseKey = null,
        public ?string $downloadUrl = null,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->licenseKey
                ? 'Lisensi Reseller & akses Karanglabs Studio kamu sudah aktif'
                : 'Akses Karanglabs Studio kamu sudah aktif',
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.studio-access',
            with: [
                'name' => $this->user->name,
                'email' => $this->user->email,
                'password' => $this->password,
                'loginUrl' => route('login'),
                'licenseKey' => $this->licenseKey,
                'downloadUrl' => $this->downloadUrl,
            ],
        );
    }
}
