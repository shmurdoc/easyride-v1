import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useAuth, useSocket, rides, COLORS, GRADIENTS, SPACING, RADIUS, decodePolyline, scheduleLocalNotification, GlowButton, GlassCard, GradientText } from '@easyryde/shared';
import type { Ride, DriverNav, DriverRoute } from '@easyryde/shared';
import type MapViewType from 'react-native-maps';

export default function ActiveRideScreen({ route, navigation }: { route: DriverRoute<'ActiveRide'>; navigation: DriverNav }) {
  const { rideId, riderId } = route.params;
  const { user, token } = useAuth();
  const { isConnected, emit, on } = useSocket({ token: token || '' });
  const [ride, setRide] = useState<Ride | null>(null);
  const [routeCoords, setRouteCoords] = useState<{ latitude: number; longitude: number }[]>([]);
  const mapRef = useRef<MapViewType>(null);

  useEffect(() => { loadRide(); }, [rideId]);

  useEffect(() => {
    if (!isConnected) return;
    const unsubs = [
      on('ride:started', (data: any) => {
        if (data.rideId === rideId) {
          loadRide();
          scheduleLocalNotification('Ride Started', 'The ride is now in progress. Drive safely!');
        }
      }),
      on('ride:cancelled', (data: any) => {
        if (data.rideId === rideId) {
          scheduleLocalNotification('Ride Cancelled', 'Rider cancelled the ride');
          Alert.alert('Ride Cancelled', 'Rider cancelled the ride');
          navigation.goBack();
        }
      }),
    ];
    return () => { unsubs.forEach(u => u()); };
  }, [isConnected]);

  useEffect(() => {
    if (!ride?.route_polyline) return;
    try {
      const decoded = decodePolyline(ride.route_polyline);
      setRouteCoords(decoded);
    } catch {}
  }, [ride?.route_polyline]);

  useEffect(() => {
    if (routeCoords.length === 0 || !ride) return;
    const timer = setTimeout(() => {
      mapRef.current?.fitToCoordinates(
        [
          { latitude: ride.pickup_latitude, longitude: ride.pickup_longitude },
          { latitude: ride.dropoff_latitude, longitude: ride.dropoff_longitude },
          ...routeCoords.slice(0, 1),
          ...routeCoords.slice(-1),
        ],
        { edgePadding: { top: 100, right: 50, bottom: 250, left: 50 }, animated: true },
      );
    }, 500);
    return () => clearTimeout(timer);
  }, [routeCoords, ride]);

  async function loadRide() { try { const data = await rides.get(rideId); setRide(data); } catch {} }

  if (!ride) return null;

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <MapView ref={mapRef} style={{ flex: 1 }} initialRegion={{ latitude: ride.pickup_latitude, longitude: ride.pickup_longitude, latitudeDelta: 0.02, longitudeDelta: 0.02 }}>
        <Marker coordinate={{ latitude: ride.pickup_latitude, longitude: ride.pickup_longitude }} title="Pickup" pinColor={COLORS.success} />
        {ride.dropoff_latitude && <Marker coordinate={{ latitude: ride.dropoff_latitude, longitude: ride.dropoff_longitude }} title="Dropoff" pinColor={COLORS.error} />}
        {routeCoords.length > 0 && (
          <>
            <Polyline coordinates={routeCoords} strokeColor={COLORS.primary} strokeWidth={4} />
            <Polyline coordinates={routeCoords} strokeColor={`${COLORS.primary}40`} strokeWidth={8} />
          </>
        )}
      </MapView>

      <LinearGradient colors={['rgba(10,10,10,0)', 'rgba(10,10,10,0.95)']} style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 80 }} />

      <View style={styles.panel}>
        <GradientText colors={GRADIENTS.primary} style={{ fontSize: 13, fontWeight: '600', lineHeight: 18, marginBottom: SPACING.md }}>
          {ride.status.replace('_', ' ')}
        </GradientText>

        <GlassCard glow style={{ marginBottom: SPACING.base }}>
          <GradientText colors={GRADIENTS.primary} style={{ fontSize: 11, fontWeight: '400', lineHeight: 14 }}>Pickup</GradientText>
          <GradientText colors={GRADIENTS.primary} style={{ fontSize: 18, fontWeight: '400', lineHeight: 27, marginBottom: SPACING.sm }}>{ride.pickup_address}</GradientText>
          <GradientText colors={GRADIENTS.primary} style={{ fontSize: 11, fontWeight: '400', lineHeight: 14 }}>Dropoff</GradientText>
          <GradientText colors={GRADIENTS.primary} style={{ fontSize: 18, fontWeight: '400', lineHeight: 27 }}>{ride.dropoff_address}</GradientText>
        </GlassCard>

        <View style={{ flexDirection: 'row', gap: SPACING.md }}>
          {ride.status === 'accepted' && (
            <>
              <GlowButton title="Mark Arrived" onPress={async () => { await rides.updateLocation(rideId, ride.pickup_latitude, ride.pickup_longitude); emit('driver:arrived', { rideId, riderId }); loadRide(); }} size="sm" style={{ flex: 1 }} />
              <GlowButton title="Chat" onPress={() => navigation.navigate('Chat', { rideId, receiverId: riderId })} size="sm" glowColor={COLORS.info} style={{ flex: 1 }} />
            </>
          )}
          {ride.status === 'arrived' && (
            <GlowButton title="Start Ride" onPress={() => { emit('ride:start', { rideId, otherUserId: riderId }); loadRide(); }} size="sm" />
          )}
          {ride.status === 'in_progress' && (
            <>
              <GlowButton title="Complete Ride" onPress={() => { emit('ride:complete', { rideId, otherUserId: riderId, fare: (ride as any)?.total_fare }); Alert.alert('Ride Completed', 'Great job!', [{ text: 'OK', onPress: () => navigation.navigate('Main') }]); }} size="sm" glowColor={COLORS.success} style={{ flex: 1 }} />
              <GlowButton title="Chat" onPress={() => navigation.navigate('Chat', { rideId, receiverId: riderId })} size="sm" glowColor={COLORS.info} style={{ flex: 1 }} />
            </>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'transparent', padding: SPACING.base, paddingBottom: 40,
  },
});
