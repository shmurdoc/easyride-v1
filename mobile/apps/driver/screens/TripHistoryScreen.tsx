import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { drivers, COLORS, GRADIENTS, SPACING, RADIUS, LoadingOverlay, RideStatusBadge, GlassCard, GradientText, Shimmer } from '@easyryde/shared';
import type { Ride } from '@easyryde/shared';

export default function TripHistoryScreen() {
  const [trips, setTrips] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadTrips(); }, []);

  async function loadTrips() {
    try { const data = await drivers.trips({ per_page: '50' }); setTrips(data.data); }
    catch {} finally { setLoading(false); }
  }

  if (loading) return (
    <LinearGradient colors={[COLORS.bgGradientStart, COLORS.bgGradientEnd]} style={{ flex: 1, padding: SPACING.base }}>
      <Shimmer height={32} width={200} borderRadius={RADIUS.sm} variant="gold" style={{ marginTop: 60, marginBottom: SPACING.lg }} />
      <Shimmer height={120} borderRadius={RADIUS.lg} variant="gold" style={{ marginBottom: SPACING.md }} />
      <Shimmer height={120} borderRadius={RADIUS.lg} variant="gold" style={{ marginBottom: SPACING.md }} />
      <Shimmer height={120} borderRadius={RADIUS.lg} variant="gold" />
    </LinearGradient>
  );

  return (
    <LinearGradient colors={[COLORS.bgGradientStart, COLORS.bgGradientEnd]} style={{ flex: 1 }}>
      <GradientText colors={GRADIENTS.primary} style={{ fontSize: 26, fontWeight: '700', lineHeight: 34, letterSpacing: -0.3, padding: SPACING.base, paddingBottom: SPACING.sm }}>
        Trip History
      </GradientText>
      <FlatList
        data={trips}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: SPACING.base }}
        ListEmptyComponent={<GradientText colors={GRADIENTS.primary} style={{ fontSize: 18, fontWeight: '400', lineHeight: 27, textAlign: 'center', marginTop: 40 }}>No trips yet</GradientText>}
        renderItem={({ item }) => (
          <GlassCard glow style={{ marginBottom: SPACING.md }}>
            <RideStatusBadge status={item.status} style={{ marginBottom: SPACING.sm }} />
            <GradientText colors={GRADIENTS.primary} style={{ fontSize: 18, fontWeight: '400', lineHeight: 27, marginBottom: SPACING.sm }}>{item.pickup_address} → {item.dropoff_address}</GradientText>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <GradientText colors={GRADIENTS.primary} style={{ fontSize: 11, fontWeight: '400', lineHeight: 14 }}>{item.rider?.name || 'Rider'}</GradientText>
              {item.total_fare && <GradientText colors={GRADIENTS.primary} style={{ fontSize: 18, fontWeight: '400', lineHeight: 27 }}>R {item.total_fare.toFixed(2)}</GradientText>}
            </View>
          </GlassCard>
        )}
      />
    </LinearGradient>
  );
}
