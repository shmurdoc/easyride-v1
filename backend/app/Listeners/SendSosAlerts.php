<?php

namespace App\Listeners;

use App\Events\SosTriggered;
use App\Services\Notification\EscalationService;

class SendSosAlerts
{
    public function __construct(protected EscalationService $escalation) {}

    public function handle(SosTriggered $event): void
    {
        $this->escalation->escalate($event->sosAlert);
    }
}
