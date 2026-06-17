import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ActivityChartProps {
  timeRange: string;
}

const mockData: Record<string, { hour: string; rides: number; revenue: number }[]> = {
  today: [
    { hour: '6AM', rides: 12, revenue: 840 },
    { hour: '9AM', rides: 28, revenue: 1960 },
    { hour: '12PM', rides: 35, revenue: 2450 },
    { hour: '3PM', rides: 22, revenue: 1540 },
    { hour: '6PM', rides: 40, revenue: 2800 },
    { hour: '9PM', rides: 18, revenue: 1260 },
  ],
  week: [
    { hour: 'Mon', rides: 145, revenue: 10150 },
    { hour: 'Tue', rides: 132, revenue: 9240 },
    { hour: 'Wed', rides: 158, revenue: 11060 },
    { hour: 'Thu', rides: 142, revenue: 9940 },
    { hour: 'Fri', rides: 175, revenue: 12250 },
    { hour: 'Sat', rides: 190, revenue: 13300 },
    { hour: 'Sun', rides: 120, revenue: 8400 },
  ],
  month: [
    { hour: 'W1', rides: 980, revenue: 68600 },
    { hour: 'W2', rides: 1050, revenue: 73500 },
    { hour: 'W3', rides: 920, revenue: 64400 },
    { hour: 'W4', rides: 1120, revenue: 78400 },
  ],
};

export function ActivityChart({ timeRange }: ActivityChartProps) {
  const data = mockData[timeRange] || mockData.today;

  return (
    <div className="card-flat p-5">
      <h3 className="text-sm font-semibold text-ink-900 mb-4">Activity & Revenue</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }} />
          <Bar yAxisId="left" dataKey="rides" fill="#3563ff" name="Rides" radius={[4, 4, 0, 0]} />
          <Bar yAxisId="right" dataKey="revenue" fill="#10B981" name="Revenue (ZAR)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
