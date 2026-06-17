import React, { useState, useEffect } from 'react';
import { FlatList, StyleSheet, Alert, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { admin, COLORS, GRADIENTS, SPACING, RADIUS } from '@easyryde/shared';
import { Typography } from '@easyryde/shared';
import { GlowButton } from '@easyryde/shared';
import { GlassCard } from '@easyryde/shared';
import { GradientText } from '@easyryde/shared';
import { Shimmer } from '@easyryde/shared';
import type { User } from '@easyryde/shared';

export default function DriversScreen() {
  const [drivers, setDrivers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { loadDrivers(); }, []);

  async function loadDrivers() { try { const data = await admin.drivers({ per_page: '50' }); setDrivers(data.data); } catch (err) { console.warn('Failed to load drivers:', err); } finally { setLoading(false); setRefreshing(false); } }

  const onRefresh = React.useCallback(() => { setRefreshing(true); loadDrivers(); }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
        <Typography variant="h2" style={{ padding: SPACING.base, paddingBottom: SPACING.sm }}>Drivers</Typography>
        {[1, 2, 3].map((i) => (
          <GlassCard key={i} style={{ marginHorizontal: SPACING.base, marginBottom: SPACING.sm }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm }}>
              <Shimmer width={120} height={20} />
              <Shimmer width={16} height={16} borderRadius={8} />
            </View>
            <Shimmer width="80%" height={14} style={{ marginBottom: SPACING.xs }} />
            <Shimmer width="60%" height={14} style={{ marginBottom: SPACING.md }} />
            <View style={{ flexDirection: 'row', gap: SPACING.md }}>
              <Shimmer style={{ flex: 1 }} height={40} borderRadius={RADIUS.md} />
              <Shimmer style={{ flex: 1 }} height={40} borderRadius={RADIUS.md} />
            </View>
          </GlassCard>
        ))}
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <LinearGradient colors={['rgba(212,175,55,0.1)', 'rgba(0,0,0,0)']} style={styles.header}>
        <Typography variant="h2">Drivers</Typography>
      </LinearGradient>
      <FlatList
        data={drivers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: SPACING.base }}
        ListEmptyComponent={<Typography variant="body" color={COLORS.textDim} style={{ textAlign: 'center', marginTop: 40 }}>No drivers found</Typography>}
        refreshing={refreshing}
        onRefresh={onRefresh}
        renderItem={({ item }) => (
          <GlassCard glow glowColor={item.is_active ? COLORS.successGlow : COLORS.primaryGlow} style={{ marginBottom: SPACING.sm }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.xs }}>
              <GradientText colors={GRADIENTS.primary} style={styles.driverName}>{item.name}</GradientText>
              <View style={[styles.statusDot, { backgroundColor: item.is_active ? COLORS.success : COLORS.textMuted }]} />
            </View>
            <Typography variant="small" color={COLORS.textMuted}>{item.email}</Typography>
            <Typography variant="small" color={COLORS.textMuted} style={{ marginBottom: SPACING.md }}>{item.phone_number}</Typography>
            <View style={{ flexDirection: 'row', gap: SPACING.md }}>
              <GlowButton title="Approve" onPress={async () => { try { await admin.approveDriver(item.id); Alert.alert('Approved', 'Driver approved'); loadDrivers(); } catch (err: any) { Alert.alert('Error', err.message); } }} size="sm" glowColor={COLORS.success} style={{ flex: 1 }} />
              <GlowButton title="Reject" onPress={async () => { try { await admin.rejectDriver(item.id); Alert.alert('Rejected', 'Driver rejected'); loadDrivers(); } catch (err: any) { Alert.alert('Error', err.message); } }} size="sm" glowColor={COLORS.error} style={{ flex: 1 }} />
            </View>
          </GlassCard>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: SPACING['2xl'], paddingBottom: SPACING.sm, paddingHorizontal: SPACING.base },
  driverName: { fontSize: 18, fontWeight: '600' },
  statusDot: { width: 12, height: 12, borderRadius: 6 },
});
