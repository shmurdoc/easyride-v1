import React, { useState, useEffect } from 'react';
import { View, RefreshControl, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth, admin, COLORS, GRADIENTS, SPACING, RADIUS } from '@easyryde/shared';
import { Typography } from '@easyryde/shared';
import { GlowButton } from '@easyryde/shared';
import { GlassCard } from '@easyryde/shared';
import { GradientText } from '@easyryde/shared';
import { AnimatedNumber } from '@easyryde/shared';
import { Shimmer } from '@easyryde/shared';

export default function DashboardScreen() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    total_users: 0, total_drivers: 0, total_rides: 0,
    active_rides: 0, total_revenue: 0, rides_today: 0,
    completed_today: 0, revenue_today: 0,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadDashboard(); }, []);

  async function loadDashboard() {
    try { const data = await admin.dashboard(); setStats(data); } catch (err) { console.warn('Failed to load dashboard:', err); }
    finally { setRefreshing(false); setLoading(false); }
  }

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
        <View style={{ padding: SPACING.base, backgroundColor: COLORS.surface }}>
          <Shimmer width={120} height={14} style={{ marginBottom: SPACING.xs }} />
          <Shimmer width={180} height={28} />
        </View>
        <View style={{ flexDirection: 'row', padding: SPACING.base, gap: SPACING.md }}>
          {[1, 2, 3, 4].map((i) => (
            <GlassCard key={i} style={{ flex: 1, alignItems: 'center' }}>
              <Shimmer width={50} height={28} style={{ marginBottom: SPACING.xs }} />
              <Shimmer width={40} height={12} />
            </GlassCard>
          ))}
        </View>
        <GlassCard style={{ marginHorizontal: SPACING.base, marginBottom: SPACING.base, alignItems: 'center' }}>
          <Shimmer width={100} height={12} style={{ marginBottom: SPACING.xs }} />
          <Shimmer width={160} height={36} style={{ marginBottom: SPACING.xs }} />
          <Shimmer width={140} height={12} />
        </GlassCard>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: COLORS.bg }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadDashboard(); }} />}
    >
      <LinearGradient colors={['rgba(212,175,55,0.15)', 'rgba(212,175,55,0)']} style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Typography variant="small" color={COLORS.textMuted}>Admin Dashboard</Typography>
            <GradientText colors={GRADIENTS.primary} style={styles.userName}>{user?.name}</GradientText>
          </View>
          <GlowButton title="Sign Out" onPress={logout} size="sm" glowColor={COLORS.error} />
        </View>
      </LinearGradient>

      <View style={{ flexDirection: 'row', padding: SPACING.base, gap: SPACING.md }}>
        <GlassCard style={{ flex: 1, alignItems: 'center' }}>
          <AnimatedNumber value={stats.total_users} useGradient style={styles.statNumber} />
          <Typography variant="xs" color={COLORS.textMuted}>Users</Typography>
        </GlassCard>
        <GlassCard style={{ flex: 1, alignItems: 'center' }}>
          <AnimatedNumber value={stats.total_drivers} useGradient style={styles.statNumber} />
          <Typography variant="xs" color={COLORS.textMuted}>Drivers</Typography>
        </GlassCard>
        <GlassCard style={{ flex: 1, alignItems: 'center' }}>
          <AnimatedNumber value={stats.active_rides} useGradient style={styles.statNumber} />
          <Typography variant="xs" color={COLORS.textMuted}>Active</Typography>
        </GlassCard>
        <GlassCard style={{ flex: 1, alignItems: 'center' }}>
          <AnimatedNumber value={stats.total_rides} useGradient style={styles.statNumber} />
          <Typography variant="xs" color={COLORS.textMuted}>Total</Typography>
        </GlassCard>
      </View>

      <GlassCard style={{ marginHorizontal: SPACING.base, marginBottom: SPACING.base, alignItems: 'center' }}>
        <Typography variant="xs" color={COLORS.textMuted}>Total Revenue</Typography>
        <AnimatedNumber value={stats.total_revenue} useGradient prefix="R" decimals={2} style={styles.revenueNumber} />
        <Typography variant="xs" color={COLORS.textMuted}>Today: R{stats.revenue_today.toFixed(2)}</Typography>
      </GlassCard>

      <View style={{ flexDirection: 'row', paddingHorizontal: SPACING.base, gap: SPACING.md }}>
        <GlassCard style={{ flex: 1, alignItems: 'center' }}>
          <AnimatedNumber value={stats.rides_today} useGradient style={styles.statNumber} />
          <Typography variant="xs" color={COLORS.textMuted}>Rides Today</Typography>
        </GlassCard>
        <GlassCard style={{ flex: 1, alignItems: 'center' }}>
          <AnimatedNumber value={stats.completed_today} useGradient style={styles.statNumber} />
          <Typography variant="xs" color={COLORS.textMuted}>Completed</Typography>
        </GlassCard>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: SPACING['2xl'], paddingBottom: SPACING.lg },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.base },
  userName: { fontSize: 26, fontWeight: '700' },
  statNumber: { fontSize: 28, fontWeight: '800' },
  revenueNumber: { fontSize: 32, fontWeight: '800', marginBottom: SPACING.xs },
});
