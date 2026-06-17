<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class DriverRejected extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public User $driver, public string $reason) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'EasyRyde Driver Application Update');
    }

    public function content(): Content
    {
        return new Content(view: 'emails.driver-rejected');
    }
}
