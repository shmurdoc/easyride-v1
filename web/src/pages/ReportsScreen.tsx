import React, { useState, useEffect } from 'react';
import PageHeader from '@/components/PageHeader';
import StatCard from '@/components/StatCard';
import client from '@/api/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#3b82f6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function ReportsScreen() {
  const [days, setDays] = useState(30);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [driverStats, setDriverStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [revenueRes, driverRes] = await Promise.all([
          client.get('/reports/revenue', { params: { days } }),
          client.get('/reports/drivers'),
        ]);
        setRevenueData(revenueRes.data?.daily || []);
        setDriverStats(driverRes.data);
      } catch {} finally { setLoading(false); }
    }
    load();
  }, [days]);

  const totalRevenue = revenueData.reduce((sum, d) => sum + (d.revenue || 0), 0);
  const totalRides = revenueData.reduce((sum, d) => sum + (d.rides || 0), 0);
  const avgPerRide = totalRides > 0 ? totalRevenue / totalRides : 0;

  return (
    <div>
      <PageHeader
        title="Reports"
        subtitle="Platform analytics and performance"
        actions={
          <select className="input max-w-[200px]" value={days} onChange={(e) => setDays(Number(e.target.value))}>
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        }
      />

      <div className="grid grid-cols-4 gap-6 mb-8">
        <StatCard label="Total Revenue" value={`R${totalRevenue.toLocaleString()}`} icon="💰" />
        <StatCard label="Total Rides" value={totalRides} icon="🚗" />
        <StatCard label="Avg per Ride" value={`R${avgPerRide.toFixed(0)}`} icon="📊" />
        <StatCard label="Active Drivers" value={driverStats?.active_drivers || 0} icon="👤" />
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500 mb-4">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="text-sm font-medium text-gray-500 mb-4">Rides Volume</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="rides" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {driverStats?.category_breakdown && (
        <div className="grid grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-sm font-medium text-gray-500 mb-4">Ride Categories</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={driverStats.category_breakdown}
                  dataKey="count"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ category, percent }) => `${category} (${(percent * 100).toFixed(0)}%)`}
                >
                  {driverStats.category_breakdown.map((_: any, i: number) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h3 className="text-sm font-medium text-gray-500 mb-4">Driver Performance</h3>
            <div className="space-y-3">
              {driverStats.top_drivers?.slice(0, 5).map((d: any, i: number) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-sm font-bold">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{d.name}</p>
                    <p className="text-xs text-gray-400">{d.total_trips} trips • R{d.total_earnings}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
