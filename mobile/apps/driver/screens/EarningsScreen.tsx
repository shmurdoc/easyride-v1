import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { drivers, COLORS, GRADIENTS, SPACING, RADIUS, LoadingOverlay, GlassCard, AnimatedNumber, GradientText } from '@easyryde/shared';
import type { WalletTransaction } from '@easyryde/shared';

export default function EarningsScreen() {
  const [earnings, setEarnings] = useState({ total: 0, today: 0, pending: 0, trips: 0 });
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { loadEarnings(); }, []);

  async function loadEarnings() {
    try {
      const data = await drivers.earnings();
      setEarnings({ total: data.total_earnings, today: data.today_earnings, pending: data.pending_payout, trips: data.total_trips });
      setTransactions(data.recent_transactions);
    } catch (err) { console.warn('Failed to load earnings:', err); } finally { setLoading(false); setRefreshing(false); }
  }

  const onRefresh = React.useCallback(() => { setRefreshing(true); loadEarnings(); }, []);

  if (loading) return <LoadingOverlay />;

  return (
    <LinearGradient colors={[COLORS.bgGradientStart, COLORS.bgGradientEnd]} style={{ flex: 1 }}>
      <LinearGradient colors={['rgba(212,175,55,0.15)', 'rgba(212,175,55,0)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ paddingTop: 60, paddingBottom: SPACING.lg, paddingHorizontal: SPACING.base }}>
        <GradientText colors={GRADIENTS.primary} style={{ fontSize: 26, fontWeight: '700', lineHeight: 34, letterSpacing: -0.3 }}>Earnings</GradientText>
      </LinearGradient>

      <View style={{ flexDirection: 'row', padding: SPACING.base, gap: SPACING.md }}>
        <GlassCard glow style={{ flex: 1, alignItems: 'center' }}>
          <AnimatedNumber value={earnings.today} prefix="R " decimals={2} useGradient style={{ fontSize: 20, fontWeight: '600', lineHeight: 28 }} />
          <GradientText colors={GRADIENTS.primary} style={{ fontSize: 11, fontWeight: '400', lineHeight: 14 }}>Today</GradientText>
        </GlassCard>
        <GlassCard glow style={{ flex: 1, alignItems: 'center' }}>
          <AnimatedNumber value={earnings.total} prefix="R " decimals={2} useGradient style={{ fontSize: 20, fontWeight: '600', lineHeight: 28 }} />
          <GradientText colors={GRADIENTS.primary} style={{ fontSize: 11, fontWeight: '400', lineHeight: 14 }}>All Time</GradientText>
        </GlassCard>
      </View>

      <View style={{ flexDirection: 'row', paddingHorizontal: SPACING.base, gap: SPACING.md, marginBottom: SPACING.base }}>
        <GlassCard style={{ flex: 1, alignItems: 'center' }}>
          <AnimatedNumber value={earnings.pending} prefix="R " decimals={2} useGradient style={{ fontSize: 20, fontWeight: '600', lineHeight: 28 }} />
          <GradientText colors={GRADIENTS.primary} style={{ fontSize: 11, fontWeight: '400', lineHeight: 14 }}>Pending</GradientText>
        </GlassCard>
        <GlassCard style={{ flex: 1, alignItems: 'center' }}>
          <AnimatedNumber value={earnings.trips} useGradient style={{ fontSize: 20, fontWeight: '600', lineHeight: 28 }} />
          <GradientText colors={GRADIENTS.primary} style={{ fontSize: 11, fontWeight: '400', lineHeight: 14 }}>Trips</GradientText>
        </GlassCard>
      </View>

      <GradientText colors={GRADIENTS.primary} style={{ fontSize: 20, fontWeight: '600', lineHeight: 28, paddingHorizontal: SPACING.base, marginBottom: SPACING.sm }}>Recent Transactions</GradientText>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: SPACING.base }}
        ListEmptyComponent={<GradientText colors={GRADIENTS.primary} style={{ fontSize: 16, fontWeight: '400', lineHeight: 24, textAlign: 'center', marginTop: 40 }}>No transactions yet</GradientText>}
        refreshing={refreshing}
        onRefresh={onRefresh}
        renderItem={({ item }) => (
          <GlassCard style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm }}>
            <View style={{ flex: 1 }}>
              <GradientText colors={GRADIENTS.primary} style={{ fontSize: 18, fontWeight: '400', lineHeight: 27 }}>{item.description || item.type}</GradientText>
              <GradientText colors={GRADIENTS.primary} style={{ fontSize: 11, fontWeight: '400', lineHeight: 14 }}>{item.created_at}</GradientText>
            </View>
            <GradientText colors={item.type === 'credit' ? GRADIENTS.primary : ['#FF3B5C', '#FF3B5C']} style={{ fontSize: 18, fontWeight: '400', lineHeight: 27 }}>
              {item.type === 'credit' ? '+' : '-'}R {item.amount.toFixed(2)}
            </GradientText>
          </GlassCard>
        )}
      />
    </LinearGradient>
  );
}
