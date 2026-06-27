import React, { useState, useEffect } from 'react';
import { View, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth, useSocket, COLORS, GRADIENTS, SPACING, GlowButton, GlassCard, GradientText, scheduleLocalNotification } from '@easyryde/shared';
import type { DriverNav } from '@easyryde/shared';

export default function RideRequestsScreen({ navigation }: { navigation: DriverNav }) {
  const { token } = useAuth();
  const { on, emit } = useSocket({ token: token || '' });
  const [requests, setRequests] = useState<any[]>([]);

  useEffect(() => {
    const unsub = on('ride:request', (data: any) => {
      setRequests((prev) => prev.find((r) => r.rideId === data.rideId) ? prev : [data, ...prev]);
      const category = data.category || 'Ride';
      scheduleLocalNotification(
        'New Ride Request',
        `${category} - ${data.distance?.toFixed(1) || '?'}km away`,
        { rideId: data.rideId },
      );
    });
    return () => unsub();
  }, []);

  const acceptRide = (request: any) => {
    emit('driver:accept-ride', { rideId: request.rideId, riderId: request.riderId });
    setRequests((prev) => prev.filter((r) => r.rideId !== request.rideId));
    navigation.navigate('ActiveRide', { rideId: request.rideId, riderId: request.riderId });
  };

  return (
    <LinearGradient colors={[COLORS.bgGradientStart, COLORS.bgGradientEnd]} style={{ flex: 1 }}>
      <GradientText colors={GRADIENTS.primary} style={{ fontSize: 26, fontWeight: '700', lineHeight: 34, letterSpacing: -0.3, padding: SPACING.base, paddingBottom: SPACING.sm }}>
        Ride Requests
      </GradientText>
      <FlatList
        data={requests}
        keyExtractor={(item) => item.rideId}
        contentContainerStyle={{ padding: SPACING.base }}
        ListEmptyComponent={<GradientText colors={GRADIENTS.primary} style={{ fontSize: 18, fontWeight: '400', lineHeight: 27, textAlign: 'center', marginTop: 40 }}>No pending requests</GradientText>}
        renderItem={({ item }) => (
          <View style={{ marginBottom: SPACING.md }}>
            <GlassCard glow>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm }}>
                <GradientText colors={GRADIENTS.primary} style={{ fontSize: 18, fontWeight: '400', lineHeight: 27 }}>{item.distance?.toFixed(1) || '?'}km away</GradientText>
                <GradientText colors={GRADIENTS.primary} style={{ fontSize: 11, fontWeight: '400', lineHeight: 14 }}>{item.category}</GradientText>
              </View>
              <GradientText colors={GRADIENTS.primary} style={{ fontSize: 18, fontWeight: '400', lineHeight: 27 }}>{item.pickup?.address || 'Pickup location'}</GradientText>
              <GradientText colors={GRADIENTS.primary} style={{ fontSize: 18, fontWeight: '400', lineHeight: 27, marginBottom: SPACING.md }}>→ {item.destination?.address || 'Destination'}</GradientText>
              <View style={{ flexDirection: 'row', gap: SPACING.md }}>
                <GlowButton title="Decline" onPress={() => setRequests((prev) => prev.filter((r) => r.rideId !== item.rideId))} size="sm" glowColor={COLORS.error} style={{ flex: 1 }} />
                <GlowButton title="Accept" onPress={() => acceptRide(item)} size="sm" style={{ flex: 1 }} />
              </View>
            </GlassCard>
          </View>
        )}
      />
    </LinearGradient>
  );
}
