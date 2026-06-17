<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Ride;
use Barryvdh\DomPDF\Facade\Pdf;

class ReceiptService
{
    public function generateReceipt(Ride $ride): string
    {
        $data = [
            'ride_id' => $ride->id,
            'date' => $ride->completed_at?->format('Y-m-d H:i') ?? $ride->updated_at->format('Y-m-d H:i'),
            'pickup' => $ride->pickup_address,
            'dropoff' => $ride->dropoff_address,
            'driver_name' => $ride->driver?->name ?? 'N/A',
            'distance_km' => number_format((float) $ride->distance_km, 1),
            'duration_minutes' => number_format((float) $ride->duration_minutes, 0),
            'base_fare' => number_format((float) $ride->base_fare, 2),
            'distance_fare' => number_format((float) ($ride->distance_km * ($ride->per_km_fare ?? 0)), 2),
            'surge_multiplier' => number_format((float) $ride->surge_multiplier, 2),
            'total_fare' => number_format((float) $ride->total_fare, 2),
            'payment_method' => $ride->payment?->method ?? 'N/A',
            'subtotal' => number_format((float) ($ride->base_fare + $ride->distance_km * ($ride->per_km_fare ?? 0)), 2),
            'surge_text' => $ride->surge_multiplier > 1
                ? number_format((float) $ride->surge_multiplier, 1).'x surge pricing applied'
                : 'Standard pricing',
        ];

        $pdf = Pdf::loadView('pdf.receipt', $data);

        $filename = 'receipt_ride_'.$ride->id.'.pdf';
        $path = 'receipts/'.$filename;

        $pdf->save(storage_path('app/public/'.$path));

        return $path;
    }
}
