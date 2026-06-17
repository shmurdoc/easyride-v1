import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Alert, Animated, TextInput, TouchableOpacity } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth, rides, useSocket, COLORS, RIDE_STATUS_LABELS, GRADIENTS, SPACING, RADIUS, decodePolyline } from '@easyryde/shared';
import { GlowButton, GlassCard, GradientText, Typography, Avatar, LoadingOverlay } from '@easyryde/shared';
import type { Ride, RiderNav, RiderRoute } from '@easyryde/shared';
import type MapViewType from 'react-native-maps';

function AnimatedDriverMarker({ coordinate: coord }: { coordinate: { latitude: number; longitude: number } }) {
  const animLat = useRef(new Animated.Value(coord.latitude)).current;
  const animLng = useRef(new Animated.Value(coord.longitude)).current;
  const [currentCoord, setCurrentCoord] = useState(coord);
  const glowAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(animLat, { toValue: coord.latitude, duration: 1000, useNativeDriver: false }),
      Animated.timing(animLng, { toValue: coord.longitude, duration: 1000, useNativeDriver: false }),
    ]).start();

    const latSub = animLat.addListener(({ value }) => setCurrentCoord((prev) => ({ ...prev, latitude: value })));
    const lngSub = animLng.addListener(({ value }) => setCurrentCoord((prev) => ({ ...prev, longitude: value })));
    return () => { animLat.removeListener(latSub); animLng.removeListener(lngSub); };
  }, [coord.latitude, coord.longitude]);

  return (
    <Marker coordinate={currentCoord} title="Driver">
      <Animated.View style={{
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: COLORS.primary,
        justifyContent: 'center', alignItems: 'center',
        opacity: glowAnim,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 16,
        elevation: 10,
      }}>
        <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: COLORS.bg }} />
      </Animated.View>
    </Marker>
  );
}

export default function RideTrackingScreen({ route, navigation }: { route: RiderRoute<'RideTracking'>; navigation: RiderNav }) {
  const { rideId } = route.params;
  const { token } = useAuth();
  const { isConnected, on, emit } = useSocket({ token: token || '' });
  const [ride, setRide] = useState<Ride | null>(null);
  const [driverLocation, setDriverLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [prevDriverLocation, setPrevDriverLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [routeCoords, setRouteCoords] = useState<{ latitude: number; longitude: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef<MapViewType>(null);
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const statusGlow = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(statusGlow, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(statusGlow, { toValue: 0.3, duration: 1000, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  useEffect(() => { loadRide(); }, [rideId]);

  useEffect(() => {
    if (!isConnected) return;
    const unsubs = [
      on('ride:accepted', (data: any) => { if (data.rideId === rideId) loadRide(); }),
      on('ride:arrived', (data: any) => { if (data.rideId === rideId) loadRide(); }),
      on('ride:started', (data: any) => { if (data.rideId === rideId) loadRide(); }),
      on('ride:completed', (data: any) => { if (data.rideId === rideId) { loadRide(); } }),
      on('ride:cancelled', (data: any) => { if (data.rideId === rideId) { loadRide(); Alert.alert('Ride Cancelled', 'Your ride has been cancelled'); navigation.goBack(); } }),
      on('driver:location', (data: any) => {
        if (data.driverId === ride?.driver_id) {
          setPrevDriverLocation((prev) => prev ?? driverLocation);
          setDriverLocation({ lat: data.latitude, lng: data.longitude });
        }
      }),
    ];
    return () => { unsubs.forEach(u => u()); };
  }, [isConnected, ride?.driver_id]);

  useEffect(() => {
    if (!ride?.route_polyline) return;
    try { setRouteCoords(decodePolyline(ride.route_polyline)); } catch {}
  }, [ride?.route_polyline]);

  useEffect(() => {
    if (routeCoords.length === 0) return;
    setTimeout(() => {
      mapRef.current?.fitToCoordinates(
        [
          { latitude: ride!.pickup_latitude, longitude: ride!.pickup_longitude },
          { latitude: ride!.dropoff_latitude, longitude: ride!.dropoff_longitude },
          ...routeCoords.slice(0, 1), ...routeCoords.slice(-1),
        ],
        { edgePadding: { top: 100, right: 50, bottom: 300, left: 50 }, animated: true },
      );
    }, 500);
  }, [routeCoords]);

  async function loadRide() {
    try {
      const data = await rides.get(rideId); setRide(data);
      if (data.status === 'completed') setShowRating(true);
    } catch (err: any) { Alert.alert('Error', err.message); }
    finally { setLoading(false); }
  }

  const cancelRide = () => {
    Alert.alert('Cancel Ride', 'Are you sure?', [
      { text: 'No', style: 'cancel' },
      { text: 'Yes', style: 'destructive', onPress: async () => { try { await rides.cancel(rideId); navigation.goBack(); } catch (err: any) { Alert.alert('Error', err.message); } } },
    ]);
  };

  const eta = ride?.driver_eta
    ? ride.driver_eta < 60
      ? `${Math.round(ride.driver_eta)} min`
      : `${Math.floor(ride.driver_eta / 60)}h ${Math.round(ride.driver_eta % 60)}min`
    : null;

  if (loading || !ride) return <LoadingOverlay />;

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{ latitude: ride.pickup_latitude, longitude: ride.pickup_longitude, latitudeDelta: 0.02, longitudeDelta: 0.02 }}
      >
        <Marker coordinate={{ latitude: ride.pickup_latitude, longitude: ride.pickup_longitude }} title="Pickup" pinColor={COLORS.success} />
        {ride.dropoff_latitude && <Marker coordinate={{ latitude: ride.dropoff_latitude, longitude: ride.dropoff_longitude }} title="Dropoff" pinColor={COLORS.error} />}
        {routeCoords.length > 0 && (
          <>
            <Polyline coordinates={routeCoords} strokeColor={COLORS.primary} strokeWidth={4} />
            <Polyline coordinates={routeCoords} strokeColor={`${COLORS.primary}40`} strokeWidth={8} />
          </>
        )}
        {driverLocation && (ride.status === 'accepted' || ride.status === 'arrived' || ride.status === 'in_progress') && (
          <AnimatedDriverMarker coordinate={{ latitude: driverLocation.lat, longitude: driverLocation.lng }} />
        )}
      </MapView>

      <LinearGradient
        colors={['transparent', 'rgba(10,10,10,0.5)', 'rgba(10,10,10,0.95)']}
        style={styles.bottomGradient}
        pointerEvents="none"
      />

      <View style={styles.panelWrapper}>
        <GlassCard padding={SPACING.base} style={styles.panel}>
          {eta && ride.status !== 'in_progress' && (
            <GradientText
              colors={GRADIENTS.primary}
              style={{ fontSize: 22, fontWeight: '700', textAlign: 'center', marginBottom: SPACING.sm }}
            >
              Driver arriving in {eta}
            </GradientText>
          )}

          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md }}>
            <Animated.View style={{
              width: 10, height: 10, borderRadius: 5,
              backgroundColor: COLORS.primary,
              marginRight: SPACING.sm,
              opacity: statusGlow,
              shadowColor: COLORS.primary,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.8,
              shadowRadius: 8,
            }} />
            <Typography variant="small" color={COLORS.primary} style={{ fontWeight: '600' }}>
              {RIDE_STATUS_LABELS[ride.status]}
            </Typography>
          </View>

          {ride.driver && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.base }}>
              <Avatar name={ride.driver.name || ''} size={48} />
              <View style={{ flex: 1, marginLeft: SPACING.md }}>
                <Typography variant="body" style={{ fontWeight: '600' }}>{ride.driver.name}</Typography>
                <Typography variant="xs" color={COLORS.textMuted}>{ride.driver.phone_number}</Typography>
              </View>
            </View>
          )}

          <GlassCard padding={SPACING.md} glow={false} style={{ marginBottom: SPACING.base }}>
            <Typography variant="xs" color={COLORS.textMuted}>From</Typography>
            <Typography variant="body" style={{ marginBottom: SPACING.sm }}>{ride.pickup_address}</Typography>
            <Typography variant="xs" color={COLORS.textMuted}>To</Typography>
            <Typography variant="body">{ride.dropoff_address}</Typography>
          </GlassCard>

          {ride.total_fare && (
            <GradientText
              colors={GRADIENTS.primary}
              style={{ fontSize: 26, fontWeight: '800', textAlign: 'center', marginBottom: SPACING.base }}
            >
              R {ride.total_fare.toFixed(2)}
            </GradientText>
          )}

          {ride.status === 'searching' && (
            <GlowButton title="Cancel Ride" onPress={cancelRide} glowColor={COLORS.error} />
          )}

          {ride.status === 'in_progress' && (
            <GlowButton title="Chat with Driver" onPress={() => navigation.navigate('Chat', { rideId, receiverId: ride.driver_id })} />
          )}

          {showRating && (
            <View style={{ alignItems: 'center', paddingTop: SPACING.md, borderTopWidth: 1, borderTopColor: COLORS.glassBorder, marginTop: SPACING.md }}>
              <Typography variant="h3" style={{ marginBottom: SPACING.md }}>Rate Your Ride</Typography>
              <View style={{ flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity key={star} onPress={() => setRating(star)}>
                    <Typography variant="h2" color={star <= rating ? '#FFD700' : COLORS.textMuted}>★</Typography>
                  </TouchableOpacity>
                ))}
              </View>
              <TextInput
                style={{ backgroundColor: COLORS.glass, color: COLORS.text, padding: SPACING.md, borderRadius: RADIUS.md, width: '100%', marginBottom: SPACING.md, minHeight: 60, borderWidth: 1, borderColor: COLORS.glassBorder }}
                placeholder="Leave a comment (optional)"
                placeholderTextColor={COLORS.textMuted}
                multiline
                value={ratingComment}
                onChangeText={setRatingComment}
              />
              <GlowButton
                title="Submit Rating"
                disabled={rating === 0}
                onPress={async () => {
                  try {
                    await rides.rate(rideId, rating, ratingComment || undefined);
                    Alert.alert('Thank You', 'Your rating has been submitted');
                    navigation.goBack();
                  } catch (err: any) { Alert.alert('Error', err.message); }
                }}
              />
            </View>
          )}
        </GlassCard>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  map: { flex: 1 },
  bottomGradient: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 300,
  },
  panelWrapper: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
  },
  panel: {
    borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl,
    paddingBottom: 40,
  },
});
