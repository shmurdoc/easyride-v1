<!DOCTYPE html>
<html><body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
<h1 style="color: #1E3A5F;">Welcome to EasyRyde!</h1>
<p>Dear {{ $driver->name }},</p>
<p>Your driver account has been <strong style="color: green;">approved</strong>.</p>
<p>You can now log in and start accepting ride requests.</p>
<p><a href="{{ config('app.url') }}/driver/login" style="background: #1E3A5F; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Go to Dashboard</a></p>
<hr><small>EasyRyde &mdash; Safe rides, fair prices.</small>
</body></html>
