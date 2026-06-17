import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { BarChart } from '../../../packages/ui-kit/src/components/BarChart';
import { EarningsSummaryCard } from '../components/EarningsSummaryCard';
import { LoadingState } from '../../../packages/ui-kit/src/components/LoadingState';
import { ErrorState } from '../../../packages/ui-kit/src/components/ErrorState';

type Period = 'daily' | 'weekly' | 'monthly';

export default function EarningsScreen() {
  const [period, setPeriod] = useState<Period>('daily');
  const [data, setData] = useState<{ labels: string[]; values: number[] }>({ labels: [], values: [] });
  const [summary, setSummary] = useState({ total: 0, rides: 0, hours: 0, avgPerRide: 0, trend: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // In production, fetch from API: GET /api/v1/drivers/earnings?period=daily
      // For now, use demo data
      const mockData = {
        daily: { labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], values: [450, 380, 520, 490, 610, 720, 580] },
        weekly: { labels: ['W1', 'W2', 'W3', 'W4'], values: [2800, 3100, 2900, 3500] },
        monthly: { labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], values: [12000, 13500, 11800, 14200, 12800, 15600] },
      };
      setData(mockData[period]);
      setSummary({ total: 3750, rides: 47, hours: 38, avgPerRide: 79.8, trend: 12.5 });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <LoadingState fullScreen />;
  if (error) return <ErrorState message={error} onRetry={fetchData} />;

  const chartData = data.labels.map((label, i) => ({ label, value: data.values[i] }));
  const bestDayIndex = data.values.indexOf(Math.max(...data.values));

  return (
    <ScrollView style={styles.container}>
      <View style={styles.periodRow}>
        {(['daily', 'weekly', 'monthly'] as Period[]).map((p) => (
          <TouchableOpacity
            key={p}
            style={[styles.periodBtn, period === p && styles.periodActive]}
            onPress={() => setPeriod(p)}
          >
            <Text style={[styles.periodText, period === p && styles.periodTextActive]}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.summaryRow}>
        <EarningsSummaryCard label="Total Earnings" value={`R${summary.total}`} trend="up" trendValue={`${summary.trend}%`} />
        <EarningsSummaryCard label="Total Rides" value={summary.rides.toString()} />
      </View>
      <View style={styles.summaryRow}>
        <EarningsSummaryCard label="Hours Online" value={`${summary.hours}h`} />
        <EarningsSummaryCard label="Avg / Ride" value={`R${summary.avgPerRide}`} />
      </View>

      <Text style={styles.sectionTitle}>Earnings Breakdown</Text>
      <BarChart data={chartData} highlightIndex={bestDayIndex} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB', padding: 16 },
  periodRow: { flexDirection: 'row', marginBottom: 16, backgroundColor: '#E5E7EB', borderRadius: 8, padding: 2 },
  periodBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 6 },
  periodActive: { backgroundColor: '#1E3A5F' },
  periodText: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
  periodTextActive: { color: '#FFFFFF' },
  summaryRow: { flexDirection: 'row', marginBottom: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#1E3A5F', marginTop: 16, marginBottom: 8 },
});
