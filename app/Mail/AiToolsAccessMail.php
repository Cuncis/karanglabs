<?php

namespace App\Mail;

use App\Models\Subscription;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AiToolsAccessMail extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * @param  User  $user  The subscriber's account.
     * @param  Subscription  $subscription  The activated subscription.
     * @param  ?string  $password  The generated password (null for an existing account).
     */
    public function __construct(
        public User $user,
        public Subscription $subscription,
        public ?string $password = null,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Langganan AI Tools kamu sudah aktif',
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.aitools-access',
            with: [
                'name' => $this->user->name,
                'email' => $this->user->email,
                'password' => $this->password,
                'loginUrl' => route('login'),
                'tier' => $this->subscription->tier,
            ],
        );
    }
}
