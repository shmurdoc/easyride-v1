import React, { useState } from 'react';
import { MetricCard } from '@/components/MetricCard';
import { ActivityChart } from '@/components/ActivityChart';
import { useRealtimeMetrics } from '@/hooks/useRealtimeMetrics';
import PageHeader from '@/components/PageHeader';

type TimeRange = 'today' | 'week' | 'month';

export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('today');
  const { metrics, isConnected } = useRealtimeMetrics();

  const metricCards = [
    { label: 'Active Rides', value: metrics.activeRides, sparkline: metrics.rideTrend },
    { label: 'Online Drivers', value: metrics.onlineDrivers, sparkline: metrics.driverTrend },
    { label: 'Revenue Today', value: `R${metrics.revenueToday?.toLocaleString()}`, sparkline: metrics.revenueTrend },
    { label: 'Pending Approvals', value: metrics.pendingApprovals },
    { label: 'Avg Wait Time', value: `${metrics.avgWaitTime}m`, sparkline: metrics.waitTimeTrend },
    { label: 'Cancellation Rate', value: `${metrics.cancellationRate}%`, sparkline: metrics.cancellationTrend },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <PageHeader title="Dashboard" subtitle="Real-time platform overview" />
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-ink-500">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-accent-500' : 'bg-warn-500'} animate-pulse`} />
            {isConnected ? 'Live' : 'Reconnecting...'}
          </div>
          <div className="flex gap-1 bg-ink-100 rounded-lg p-1">
            {(['today', 'week', 'month'] as TimeRange[]).map(range => (
              <button
                key={range}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  timeRange === range ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500 hover:text-ink-700'
                }`}
                onClick={() => setTimeRange(range)}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        {metricCards.map(card => (
          <MetricCard key={card.label} {...card} />
        ))}
      </div>

      <ActivityChart timeRange={timeRange} />
    </div>
  );
}
