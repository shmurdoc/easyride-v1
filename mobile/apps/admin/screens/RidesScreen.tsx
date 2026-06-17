import React, { useState, useEffect } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { admin, COLORS, GRADIENTS, SPACING, RADIUS } from '@easyryde/shared';
import { Typography } from '@easyryde/shared';
import { Chip } from '@easyryde/shared';
import { GlassCard } from '@easyryde/shared';
import { GradientText } from '@easyryde/shared';
import { Shimmer } from '@easyryde/shared';
import { RideStatusBadge } from '@easyryde/shared';
import type { Ride } from '@easyryde/shared';

export default function RidesScreen() {
  const [ridesList, setRidesList] = useState<Ride[]>([]);
  const [filter, setFilter] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { loadRides(); }, [filter]);

  async function loadRides() {
    try { const params: Record<string, string> = { per_page: '50' }; if (filter) params.status = filter; const data = await admin.rides(params); setRidesList(data.data); }
    catch (err) { console.warn('Failed to load rides:', err); } finally { setLoading(false); setRefreshing(false); }
  }

  const onRefresh = React.useCallback(() => { setRefreshing(true); loadRides(); }, [filter]);

  const filters = ['all', 'searching', 'accepted', 'in_progress', 'completed', 'cancelled'];

  const getStatusGlow = (status: string) => {
    switch (status) {
      case 'completed': return COLORS.successGlow;
      case 'cancelled': return COLORS.errorGlow;
      case 'in_progress': return COLORS.primaryGlow;
      default: return 'rgba(255,255,255,0.05)';
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
        <Typography variant="h2" style={{ padding: SPACING.base, paddingBottom: SPACING.sm }}>Rides</Typography>
        <View style={{ flexDirection: 'row', paddingHorizontal: SPACING.base, marginBottom: SPACING.base, gap: SPACING.sm }}>
          {[1, 2, 3].map((i) => <Shimmer key={i} width={70} height={32} borderRadius={RADIUS.full} />)}
        </View>
        {[1, 2, 3].map((i) => (
          <GlassCard key={i} style={{ marginHorizontal: SPACING.base, marginBottom: SPACING.sm }}>
            <Shimmer width={80} height={20} style={{ marginBottom: SPACING.sm }} />
            <Shimmer width="100%" height={16} style={{ marginBottom: SPACING.sm }} />
            <Shimmer width="60%" height={14} />
          </GlassCard>
        ))}
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <LinearGradient colors={['rgba(212,175,55,0.1)', 'rgba(0,0,0,0)']} style={styles.header}>
        <Typography variant="h2">Rides</Typography>
      </LinearGradient>

      <View style={{ flexDirection: 'row', paddingHorizontal: SPACING.base, marginBottom: SPACING.base, gap: SPACING.sm }}>
        {filters.map((f) => (
          <Chip key={f} label={f === 'all' ? 'All' : f.replace('_', ' ')} selected={filter === f || (f === 'all' && filter === null)} onPress={() => setFilter(f === 'all' ? null : f)} />
        ))}
      </View>

      <FlatList
        data={ridesList}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: SPACING.base }}
        ListEmptyComponent={<Typography variant="body" color={COLORS.textDim} style={{ textAlign: 'center', marginTop: 40 }}>No rides found</Typography>}
        refreshing={refreshing}
        onRefresh={onRefresh}
        renderItem={({ item }) => (
          <GlassCard glow glowColor={getStatusGlow(item.status)} style={{ marginBottom: SPACING.sm }}>
            <RideStatusBadge status={item.status} style={{ marginBottom: SPACING.sm }} />
            <Typography variant="body" style={{ marginBottom: SPACING.sm }}>{item.pickup_address} → {item.dropoff_address}</Typography>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Typography variant="small" color={COLORS.textMuted}>{item.rider?.name || item.rider_id}</Typography>
              {item.total_fare && <GradientText colors={GRADIENTS.primary} style={styles.price}>R {item.total_fare.toFixed(2)}</GradientText>}
            </View>
          </GlassCard>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: SPACING['2xl'], paddingBottom: SPACING.sm, paddingHorizontal: SPACING.base },
  price: { fontSize: 18, fontWeight: '700' },
});
