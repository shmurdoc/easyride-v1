<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>EasyRyde Receipt #{{ $ride_id }}</title>
<style>
body { font-family: DejaVu Sans, sans-serif; font-size: 12px; color: #333; margin: 0; padding: 20px; }
.header { text-align: center; border-bottom: 2px solid #f97316; padding-bottom: 15px; margin-bottom: 20px; }
.header h1 { color: #f97316; margin: 0; font-size: 24px; }
.header p { color: #666; margin: 5px 0 0 0; }
.section { margin-bottom: 20px; }
.section h2 { font-size: 14px; color: #f97316; border-bottom: 1px solid #eee; padding-bottom: 5px; }
.row { display: flex; justify-content: space-between; padding: 3px 0; }
.label { color: #666; }
.value { font-weight: bold; }
.total { font-size: 16px; color: #f97316; border-top: 2px solid #f97316; padding-top: 8px; margin-top: 8px; }
.footer { text-align: center; color: #999; font-size: 10px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 10px; }
</style>
</head>
<body>
<div class="header">
<h1>EasyRyde</h1>
<p>Payment Receipt</p>
</div>
<div class="section">
<h2>Ride Details</h2>
<div class="row"><span class="label">Receipt #</span><span class="value">{{ $ride_id }}</span></div>
<div class="row"><span class="label">Date</span><span class="value">{{ $date }}</span></div>
<div class="row"><span class="label">Driver</span><span class="value">{{ $driver_name }}</span></div>
<div class="row"><span class="label">Pickup</span><span class="value">{{ $pickup }}</span></div>
<div class="row"><span class="label">Dropoff</span><span class="value">{{ $dropoff }}</span></div>
<div class="row"><span class="label">Distance</span><span class="value">{{ $distance_km }} km</span></div>
<div class="row"><span class="label">Duration</span><span class="value">{{ $duration_minutes }} min</span></div>
</div>
<div class="section">
<h2>Fare Breakdown</h2>
<div class="row"><span class="label">Base Fare</span><span class="value">R {{ $base_fare }}</span></div>
<div class="row"><span class="label">Distance Fare</span><span class="value">R {{ $distance_fare }}</span></div>
<div class="row"><span class="label">Subtotal</span><span class="value">R {{ $subtotal }}</span></div>
<div class="row"><span class="label">{{ $surge_text }}</span><span class="value"></span></div>
<div class="row total"><span class="label">Total</span><span class="value">R {{ $total_fare }}</span></div>
<div class="row"><span class="label">Payment Method</span><span class="value">{{ ucfirst($payment_method) }}</span></div>
</div>
<div class="footer">
<p>EasyRyde &bull; Thank you for riding with us</p>
<p>This is a computer-generated receipt.</p>
</div>
</body>
</html>
