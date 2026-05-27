<?php

namespace App\Notifications;

use App\Models\PromoCode;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class DiscountApplied extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        protected PromoCode $promo,
        protected float $discount
    )
    {
        $this->onQueue('horizon');
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'promo_code' => $this->promo->code,
            'discount' => $this->discount,
            'type' => $this->promo->type,
            'message' => 'Discount of ' . number_format($this->discount, 2) . ' applied with promo code ' . $this->promo->code,
        ];
    }
}
