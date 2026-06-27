import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { drivers, COLORS, GRADIENTS, SPACING, RADIUS, RideStatusBadge, GlassCard, GradientText, Shimmer, GlowButton } from '@easyryde/shared';
import type { Ride } from '@easyryde/shared';

export default function TripHistoryScreen() {
  const [trips, setTrips] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { loadTrips(); }, []);

  async function loadTrips() {
    try {
      setError(null);
      const data = await drivers.trips({ per_page: '50' });
      setTrips(data.data);
    } catch {
      setError('Failed to load trips');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadTrips();
  }, []);

  const showTripDetail = useCallback((item: Ride) => {
    const date = item.created_at ? new Date(item.created_at).toLocaleDateString() : '';
    Alert.alert(
      'Trip Details',
      [
        `Date: ${date}`,
        `From: ${item.pickup_address}`,
        `To: ${item.dropoff_address}`,
        `Status: ${item.status}`,
        item.total_fare ? `Fare: R${item.total_fare.toFixed(2)}` : '',
        item.distance_km ? `Distance: ${item.distance_km.toFixed(1)} km` : '',
        item.duration_minutes ? `Duration: ${item.duration_minutes} min` : '',
        item.rider?.name ? `Rider: ${item.rider.name}` : '',
      ].filter(Boolean).join('\n'),
    );
  }, []);

  if (loading) return (
    <LinearGradient colors={[COLORS.bgGradientStart, COLORS.bgGradientEnd]} style={{ flex: 1, padding: SPACING.base }}>
      <Shimmer height={32} width={200} borderRadius={RADIUS.sm} variant="gold" style={{ marginTop: 60, marginBottom: SPACING.lg }} />
      <Shimmer height={120} borderRadius={RADIUS.lg} variant="gold" style={{ marginBottom: SPACING.md }} />
      <Shimmer height={120} borderRadius={RADIUS.lg} variant="gold" style={{ marginBottom: SPACING.md }} />
      <Shimmer height={120} borderRadius={RADIUS.lg} variant="gold" />
    </LinearGradient>
  );

  if (error) return (
    <LinearGradient colors={[COLORS.bgGradientStart, COLORS.bgGradientEnd]} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.base }}>
      <GradientText colors={GRADIENTS.primary} style={{ fontSize: 16, textAlign: 'center', marginBottom: SPACING.md }}>{error}</GradientText>
      <GlowButton title="Retry" onPress={() => { setLoading(true); loadTrips(); }} size="md" />
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
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={<GradientText colors={GRADIENTS.primary} style={{ fontSize: 18, fontWeight: '400', lineHeight: 27, textAlign: 'center', marginTop: 40 }}>No trips yet</GradientText>}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => showTripDetail(item)} activeOpacity={0.7}>
            <GlassCard glow style={{ marginBottom: SPACING.md }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.sm }}>
                <RideStatusBadge status={item.status} />
                {item.created_at && (
                  <GradientText colors={GRADIENTS.primary} style={{ fontSize: 11, lineHeight: 14 }}>{new Date(item.created_at).toLocaleDateString()}</GradientText>
                )}
              </View>
              <GradientText colors={GRADIENTS.primary} style={{ fontSize: 18, fontWeight: '400', lineHeight: 27, marginBottom: SPACING.sm }}>{item.pickup_address} → {item.dropoff_address}</GradientText>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <GradientText colors={GRADIENTS.primary} style={{ fontSize: 11, lineHeight: 14 }}>{item.rider?.name || 'Rider'}</GradientText>
                {item.total_fare != null && <GradientText colors={GRADIENTS.primary} style={{ fontSize: 18, fontWeight: '600', lineHeight: 27 }}>R {item.total_fare.toFixed(2)}</GradientText>}
              </View>
            </GlassCard>
          </TouchableOpacity>
        )}
      />
    </LinearGradient>
  );
}
