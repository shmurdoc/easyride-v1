import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, RefreshControl, ScrollView } from 'react-native';
import { useAuth, admin } from '@easyryde/shared';
import { COLORS, formatCurrency } from '@easyryde/shared';

export default function DashboardScreen() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    total_users: 0, total_drivers: 0, total_rides: 0,
    active_rides: 0, total_revenue: 0, rides_today: 0,
    completed_today: 0, revenue_today: 0,
  });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { loadDashboard(); }, []);

  async function loadDashboard() {
    try {
      const data = await admin.dashboard();
      setStats(data);
    } catch {} finally { setRefreshing(false); }
  }

  const onRefresh = () => { setRefreshing(true); loadDashboard(); };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Admin Dashboard</Text>
          <Text style={styles.name}>{user?.name}</Text>
        </View>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logout}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: '#7C3AED' }]}>
          <Text style={styles.statValueWhite}>{stats.total_users}</Text>
          <Text style={styles.statLabelWhite}>Total Users</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#10B981' }]}>
          <Text style={styles.statValueWhite}>{stats.total_drivers}</Text>
          <Text style={styles.statLabelWhite}>Drivers</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.active_rides}</Text>
          <Text style={styles.statLabel}>Active Rides</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.total_rides}</Text>
          <Text style={styles.statLabel}>Total Rides</Text>
        </View>
      </View>

      <View style={styles.revenueCard}>
        <Text style={styles.revenueLabel}>Total Revenue</Text>
        <Text style={styles.revenueValue}>{formatCurrency(stats.total_revenue)}</Text>
        <Text style={styles.revenueToday}>Today: {formatCurrency(stats.revenue_today)}</Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.rides_today}</Text>
          <Text style={styles.statLabel}>Rides Today</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.completed_today}</Text>
          <Text style={styles.statLabel}>Completed Today</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.gray[50] },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 24, backgroundColor: COLORS.white,
  },
  greeting: { fontSize: 14, color: COLORS.gray[400] },
  name: { fontSize: 22, fontWeight: 'bold', color: COLORS.gray[800] },
  logout: { color: '#7C3AED', fontSize: 14, fontWeight: '600' },
  statsGrid: { flexDirection: 'row', padding: 24, gap: 12 },
  statCard: {
    flex: 1, backgroundColor: COLORS.white, borderRadius: 16, padding: 16, alignItems: 'center',
  },
  statValue: { fontSize: 24, fontWeight: 'bold', color: COLORS.gray[800] },
  statValueWhite: { fontSize: 24, fontWeight: 'bold', color: COLORS.white },
  statLabel: { fontSize: 12, color: COLORS.gray[400], marginTop: 4 },
  statLabelWhite: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  revenueCard: {
    margin: 24, marginTop: 0, backgroundColor: '#7C3AED', borderRadius: 20, padding: 24, alignItems: 'center',
  },
  revenueLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 14 },
  revenueValue: { color: COLORS.white, fontSize: 36, fontWeight: 'bold', marginVertical: 8 },
  revenueToday: { color: 'rgba(255,255,255,0.7)', fontSize: 14 },
});
