<?php

namespace App\Notifications;

use App\Models\IncidentReport;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class IncidentAlertNotification extends Notification
{
    use Queueable;

    public function __construct(
        private IncidentReport $incident,
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Critical Incident Alert - '.$this->incident->title)
            ->line('A critical incident has been reported that requires immediate attention.')
            ->line('Type: '.$this->incident->incident_type)
            ->line('Severity: '.$this->incident->severity)
            ->line('Title: '.$this->incident->title)
            ->line('Description: '.$this->incident->description)
            ->action('View Incident', url('/admin/incidents/'.$this->incident->id))
            ->line('Please review and take appropriate action.');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'incident_id' => $this->incident->id,
            'type' => $this->incident->incident_type,
            'severity' => $this->incident->severity,
            'title' => $this->incident->title,
            'description' => $this->incident->description,
        ];
    }
}
