<!DOCTYPE html>
<html><body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
<h1 style="color: #1E3A5F;">Payment Receipt</h1>
<p>Your payment of <strong>R{{ number_format($payment->amount, 2) }}</strong> was successful.</p>
<p><strong>Ride ID:</strong> {{ $payment->ride_id }}</p>
<p><strong>Payment Method:</strong> {{ ucfirst($payment->gateway) }}</p>
<p><strong>Date:</strong> {{ $payment->created_at->format('d M Y H:i') }}</p>
<p>Thank you for using EasyRyde!</p>
<hr><small>EasyRyde &mdash; Safe rides, fair prices.</small>
</body></html>
