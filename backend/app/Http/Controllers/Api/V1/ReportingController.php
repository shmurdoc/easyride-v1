<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Reporting\RevenueReportRequest;
use App\Models\Delivery;
use App\Models\Payment;
use App\Models\Ride;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class ReportingController extends Controller
{
    public function dashboard(Request $request): JsonResponse
    {
        $tenantId = $request->user()->tenant_id;
        $days = (int) ($request->days ?? 30);

        $from = now()->subDays($days);

        $rides = Ride::where('tenant_id', $tenantId)
            ->where('created_at', '>=', $from);

        $rideStats = [
            'total' => $rides->count(),
            'completed' => (clone $rides)->where('status', 'completed')->count(),
            'cancelled' => (clone $rides)->where('status', 'cancelled')->count(),
            'revenue' => (float) (clone $rides)->where('status', 'completed')->sum('total_fare'),
            'avg_fare' => (float) (clone $rides)->where('status', 'completed')->avg('total_fare'),
            'avg_distance' => (float) (clone $rides)->where('status', 'completed')->avg('distance_km'),
            'avg_duration' => (float) (clone $rides)->where('status', 'completed')->avg('duration_minutes'),
        ];

        $deliveryStats = [
            'total' => Delivery::where('tenant_id', $tenantId)->where('created_at', '>=', $from)->count(),
            'delivered' => Delivery::where('tenant_id', $tenantId)
                ->where('status', 'delivered')
                ->where('created_at', '>=', $from)->count(),
        ];

        $paymentStats = [
            'total' => Payment::whereHas('payer', fn ($q) => $q->where('tenant_id', $tenantId))->where('created_at', '>=', $from)->count(),
            'completed' => Payment::whereHas('payer', fn ($q) => $q->where('tenant_id', $tenantId))
                ->where('status', 'completed')
                ->where('created_at', '>=', $from)->count(),
            'total_amount' => (float) Payment::whereHas('payer', fn ($q) => $q->where('tenant_id', $tenantId))
                ->where('status', 'completed')
                ->where('created_at', '>=', $from)->sum('amount'),
        ];

        $walletStats = [
            'total_deposits' => (float) Wallet::whereHas('user', fn ($q) => $q->where('tenant_id', $tenantId))->sum('balance'),
            'total_pending' => (float) Wallet::whereHas('user', fn ($q) => $q->where('tenant_id', $tenantId))->sum('pending_balance'),
        ];

        $userStats = [
            'total_users' => User::where('tenant_id', $tenantId)->count(),
            'total_riders' => User::where('tenant_id', $tenantId)->where('role', 'rider')->count(),
            'total_drivers' => User::where('tenant_id', $tenantId)->where('role', 'driver')->count(),
        ];

        $dailyRevenue = Ride::where('tenant_id', $tenantId)
            ->where('status', 'completed')
            ->where('created_at', '>=', $from)
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(*) as rides'),
                DB::raw('SUM(total_fare) as revenue'),
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return response()->json([
            'period' => "{$days} days",
            'rides' => $rideStats,
            'deliveries' => $deliveryStats,
            'payments' => $paymentStats,
            'wallet' => $walletStats,
            'users' => $userStats,
            'daily_revenue' => $dailyRevenue,
        ]);
    }

    public function revenue(RevenueReportRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $from = isset($validated['from']) ? Carbon::parse($validated['from']) : now()->subDays(30);
        $to = isset($validated['to']) ? Carbon::parse($validated['to']) : now();
        $groupBy = $validated['group_by'] ?? 'day';

        $periodFormat = match ($groupBy) {
            'week' => '%x-W%v',
            'month' => 'Y-m',
            default => 'Y-m-d',
        };

        $driver = DB::connection()->getDriverName();
        $periodExpr = $driver === 'pgsql'
            ? "TO_CHAR(created_at, '{$periodFormat}')"
            : "strftime('{$periodFormat}', created_at)";

        $revenue = Ride::where('tenant_id', $request->user()->tenant_id)
            ->where('status', 'completed')
            ->where('created_at', '>=', $from)
            ->where('created_at', '<=', $to)
            ->select(
                DB::raw("{$periodExpr} as period"),
                DB::raw('COUNT(*) as total_rides'),
                DB::raw('SUM(total_fare) as total_revenue'),
                DB::raw('AVG(total_fare) as avg_fare'),
                DB::raw('SUM(distance_km) as total_distance'),
            )
            ->groupBy('period')
            ->orderBy('period')
            ->get();

        return response()->json($revenue);
    }

    public function rides(Request $request): JsonResponse
    {
        $tenantId = $request->user()->tenant_id;
        $days = (int) ($request->days ?? 30);
        $from = now()->subDays($days);

        $rides = Ride::where('tenant_id', $tenantId)
            ->where('created_at', '>=', $from)
            ->select('id', 'status', 'total_fare', 'distance_km', 'duration_minutes', 'created_at')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($rides);
    }

    public function revenueExport(Request $request): JsonResponse
    {
        $tenantId = $request->user()->tenant_id;
        $days = (int) ($request->days ?? 30);
        $from = now()->subDays($days);

        $revenue = Ride::where('tenant_id', $tenantId)
            ->where('status', 'completed')
            ->where('created_at', '>=', $from)
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(*) as total_rides'),
                DB::raw('SUM(total_fare) as total_revenue'),
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return response()->json($revenue);
    }

    public function drivers(Request $request): JsonResponse
    {
        $driverStats = User::where('tenant_id', $request->user()->tenant_id)
            ->where('role', 'driver')
            ->withCount(['ridesAsDriver as total_rides' => function ($q) {
                $q->where('status', 'completed');
            }])
            ->get()
            ->map(fn ($d) => [
                'id' => $d->id,
                'name' => $d->name,
                'email' => $d->email,
                'is_online' => $d->driverProfile?->is_online ?? false,
                'avg_rating' => round((float) ($d->driverProfile?->average_rating ?? 0), 2),
                'total_rides' => $d->total_rides,
            ]);

        return response()->json($driverStats);
    }
}
