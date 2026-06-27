import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { rides, COLORS, GRADIENTS, SPACING, RADIUS } from '@easyryde/shared';
import { GlassCard, Shimmer, ErrorState, RideStatusBadge, Button } from '@easyryde/shared';
import type { Ride, RiderRoute, RiderNav } from '@easyryde/shared';

export default function RideDetailScreen({ navigation, route }: { navigation: RiderNav; route: RiderRoute<'RideDetail'> }) {
  const { rideId } = route.params;
  const [ride, setRide] = useState<Ride | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { loadRide(); }, [rideId]);

  async function loadRide() {
    setLoading(true);
    setError('');
    try {
      const data = await rides.get(rideId);
      setRide(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load ride details');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="Ride Details" onBack={() => navigation.goBack()} />
        <View style={{ padding: SPACING.base, gap: SPACING.md }}>
          <Shimmer height={180} borderRadius={RADIUS.lg} />
          <Shimmer height={120} borderRadius={RADIUS.lg} />
          <Shimmer height={80} borderRadius={RADIUS.lg} />
          <Shimmer height={120} borderRadius={RADIUS.lg} />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Header title="Ride Details" onBack={() => navigation.goBack()} />
        <ErrorState message={error} onRetry={loadRide} />
      </View>
    );
  }

  if (!ride) return null;

  const fareBreakdown = [
    { label: 'Base fare', value: ride.base_fare },
    { label: 'Distance', value: ride.distance_km ? (ride.distance_km * (ride.per_km_fare || 12)) : undefined },
    { label: 'Time', value: ride.duration_minutes ? (ride.duration_minutes * 2) : undefined },
  ];

  const validFares = fareBreakdown.filter(f => f.value != null) as { label: string; value: number }[];
  const totalFare = ride.total_fare ?? validFares.reduce((s, f) => s + f.value, 0);
  const platformFee = totalFare * 0.05;

  const isInProgress = ride.status === 'in_progress' || ride.status === 'accepted' || ride.status === 'arrived';

  return (
    <View style={styles.container}>
      <Header title="Ride Details" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <RideStatusBadge status={ride.status} style={{ marginBottom: SPACING.base }} />

        <GlassCard padding={SPACING.md} style={{ marginBottom: SPACING.base }}>
          <View style={styles.addressSection}>
            <View style={styles.dotColumn}>
              <View style={styles.dotStart} />
              <View style={styles.dotLine} />
              <View style={styles.dotEnd} />
            </View>
            <View style={styles.addressColumn}>
              <Text style={styles.addressLabel}>From</Text>
              <Text style={styles.addressText}>{ride.pickup_address}</Text>
              <View style={styles.addressSpacer} />
              <Text style={styles.addressLabel}>To</Text>
              <Text style={styles.addressText}>{ride.dropoff_address}</Text>
            </View>
          </View>
        </GlassCard>

        <GlassCard padding={SPACING.md} style={{ marginBottom: SPACING.base }}>
          <View style={styles.row}>
            <Ionicons name="calendar-outline" size={18} color={COLORS.textMuted} />
            <Text style={styles.rowText}>{new Date(ride.created_at).toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</Text>
          </View>
          <View style={styles.row}>
            <Ionicons name="time-outline" size={18} color={COLORS.textMuted} />
            <Text style={styles.rowText}>{new Date(ride.created_at).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })}</Text>
          </View>
          <View style={styles.row}>
            <Ionicons name="car-outline" size={18} color={COLORS.textMuted} />
            <Text style={styles.rowText}>{ride.category ? ride.category.charAt(0).toUpperCase() + ride.category.slice(1) : 'Standard'}</Text>
          </View>
        </GlassCard>

        {ride.driver && (
          <GlassCard padding={SPACING.md} style={{ marginBottom: SPACING.base }}>
            <Text style={styles.sectionTitle}>Driver</Text>
            <View style={styles.driverRow}>
              <View style={styles.driverIcon}>
                <Ionicons name="person" size={24} color={COLORS.text} />
              </View>
              <View style={styles.driverInfo}>
                <Text style={styles.driverName}>{ride.driver.name}</Text>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={14} color={COLORS.primary} />
                  <Text style={styles.ratingText}>
                    {(ride.driver as any).average_rating ?? '4.5'} · {(ride.driver as any).total_trips ?? 0} trips
                  </Text>
                </View>
              </View>
              {ride.driver.vehicle && (
                <Text style={styles.vehicleText}>
                  {(ride.driver as any).vehicle?.make} {(ride.driver as any).vehicle?.model}
                </Text>
              )}
            </View>
          </GlassCard>
        )}

        {ride.payment_method && (
          <GlassCard padding={SPACING.md} style={{ marginBottom: SPACING.base }}>
            <Text style={styles.sectionTitle}>Payment</Text>
            <View style={styles.row}>
              <Ionicons name="card-outline" size={18} color={COLORS.textMuted} />
              <Text style={styles.rowText}>{ride.payment_method}</Text>
            </View>
            {ride.payment_status && (
              <View style={styles.row}>
                <Ionicons name="checkmark-circle-outline" size={18} color={ride.payment_status === 'completed' ? COLORS.success : COLORS.textMuted} />
                <Text style={[styles.rowText, ride.payment_status === 'completed' && { color: COLORS.success }]}>
                  {ride.payment_status.charAt(0).toUpperCase() + ride.payment_status.slice(1)}
                </Text>
              </View>
            )}
          </GlassCard>
        )}

        <GlassCard padding={SPACING.md} style={{ marginBottom: SPACING.base }}>
          <Text style={styles.sectionTitle}>Fare Breakdown</Text>
          {validFares.map((f, i) => (
            <View key={i} style={styles.fareRow}>
              <Text style={styles.fareLabel}>{f.label}</Text>
              <Text style={styles.fareValue}>R{f.value.toFixed(2)}</Text>
            </View>
          ))}
          <View style={styles.fareRow}>
            <Text style={styles.fareLabel}>Platform fee</Text>
            <Text style={styles.fareValue}>R{platformFee.toFixed(2)}</Text>
          </View>
          {ride.discount_amount && ride.discount_amount > 0 ? (
            <View style={styles.fareRow}>
              <Text style={[styles.fareLabel, { color: COLORS.success }]}>Discount</Text>
              <Text style={[styles.fareValue, { color: COLORS.success }]}>-R{ride.discount_amount.toFixed(2)}</Text>
            </View>
          ) : null}
          <View style={styles.divider} />
          <View style={styles.fareRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>R{totalFare.toFixed(2)}</Text>
          </View>
        </GlassCard>

        {isInProgress && (
          <Button
            title="Request Help"
            onPress={() => Alert.alert('Help', 'Contact support at support@easyryde.com or call 015 000 0000')}
            variant="secondary"
            size="lg"
            style={{ marginTop: SPACING.sm }}
          />
        )}
      </ScrollView>
    </View>
  );
}

function Header({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <View style={headerStyles.container}>
      <TouchableOpacity onPress={onBack} style={headerStyles.backBtn}>
        <Ionicons name="arrow-back" size={24} color={COLORS.text} />
      </TouchableOpacity>
      <Text style={headerStyles.title}>{title}</Text>
      <View style={{ width: 40 }} />
    </View>
  );
}

const headerStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    paddingTop: 56,
    backgroundColor: COLORS.bg,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center' },
  title: { color: COLORS.text, fontSize: 18, fontWeight: '600' },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scrollContent: { padding: SPACING.base, paddingBottom: 40 },
  addressSection: { flexDirection: 'row', gap: SPACING.md },
  dotColumn: { alignItems: 'center', width: 12 },
  dotStart: { width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.primary },
  dotLine: { width: 2, flex: 1, backgroundColor: COLORS.border, marginVertical: 4 },
  dotEnd: { width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.textMuted },
  addressColumn: { flex: 1 },
  addressLabel: { color: COLORS.textMuted, fontSize: 12, fontWeight: '500', marginBottom: 2 },
  addressText: { color: COLORS.text, fontSize: 15, fontWeight: '500' },
  addressSpacer: { height: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm },
  rowText: { color: COLORS.text, fontSize: 14, flex: 1 },
  sectionTitle: { color: COLORS.textMuted, fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: SPACING.md },
  driverRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  driverIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.surfaceElevated, justifyContent: 'center', alignItems: 'center' },
  driverInfo: { flex: 1 },
  driverName: { color: COLORS.text, fontSize: 16, fontWeight: '600' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  ratingText: { color: COLORS.textMuted, fontSize: 13 },
  vehicleText: { color: COLORS.textDim, fontSize: 13 },
  fareRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm },
  fareLabel: { color: COLORS.textMuted, fontSize: 14 },
  fareValue: { color: COLORS.text, fontSize: 14, fontWeight: '500' },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: SPACING.sm },
  totalLabel: { color: COLORS.text, fontSize: 16, fontWeight: '700' },
  totalValue: { color: COLORS.primary, fontSize: 18, fontWeight: '800' },
});
