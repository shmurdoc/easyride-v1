import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useAuth, useSocket, rides } from '@easyryde/shared';
import { COLORS, RIDE_STATUS_LABELS } from '@easyryde/shared';
import type { Ride } from '@easyryde/shared';

export default function ActiveRideScreen({ route, navigation }: any) {
  const { rideId, riderId } = route.params;
  const { user, token } = useAuth();
  const { isConnected, emit, on } = useSocket({ token: token || '' });
  const [ride, setRide] = useState<Ride | null>(null);

  useEffect(() => {
    loadRide();
  }, [rideId]);

  useEffect(() => {
    if (!isConnected) return;
    const unsub1 = on('ride:started', (data: any) => {
      if (data.rideId === rideId) loadRide();
    });
    const unsub2 = on('ride:cancelled', (data: any) => {
      if (data.rideId === rideId) {
        Alert.alert('Ride Cancelled', 'Rider cancelled the ride');
        navigation.goBack();
      }
    });
    return () => { unsub1(); unsub2(); };
  }, [isConnected]);

  async function loadRide() {
    try {
      const data = await rides.get(rideId);
      setRide(data);
    } catch {}
  }

  const markArrived = async () => {
    try {
      await rides.updateLocation(rideId, ride?.pickup_latitude || 0, ride?.pickup_longitude || 0);
      emit('driver:arrived', { rideId, riderId });
      loadRide();
    } catch {}
  };

  const startRide = async () => {
    try {
      emit('ride:start', { rideId, otherUserId: riderId });
      loadRide();
    } catch {}
  };

  const completeRide = async () => {
    try {
      emit('ride:complete', { rideId, otherUserId: riderId, fare: ride?.total_fare });
      Alert.alert('Ride Completed', 'Great job!', [
        { text: 'OK', onPress: () => navigation.navigate('Main') },
      ]);
    } catch {}
  };

  const openChat = () => {
    navigation.navigate('Chat', { rideId, receiverId: riderId });
  };

  if (!ride) return null;

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: ride.pickup_latitude,
          longitude: ride.pickup_longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
      >
        <Marker coordinate={{ latitude: ride.pickup_latitude, longitude: ride.pickup_longitude }} title="Pickup" pinColor={COLORS.success} />
        {ride.dropoff_latitude && (
          <Marker coordinate={{ latitude: ride.dropoff_latitude, longitude: ride.dropoff_longitude }} title="Dropoff" pinColor={COLORS.danger} />
        )}
      </MapView>

      <View style={styles.panel}>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{RIDE_STATUS_LABELS[ride.status]}</Text>
        </View>

        <View style={styles.routeInfo}>
          <Text style={styles.routeLabel}>Pickup</Text>
          <Text style={styles.routeAddress}>{ride.pickup_address}</Text>
          <Text style={styles.routeLabel}>Dropoff</Text>
          <Text style={styles.routeAddress}>{ride.dropoff_address}</Text>
        </View>

        <View style={styles.actions}>
          {ride.status === 'accepted' && (
            <>
              <TouchableOpacity style={styles.actionButton} onPress={markArrived}>
                <Text style={styles.actionText}>Mark Arrived</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.chatButton} onPress={openChat}>
                <Text style={styles.chatText}>Chat</Text>
              </TouchableOpacity>
            </>
          )}
          {ride.status === 'arrived' && (
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#10B981' }]} onPress={startRide}>
              <Text style={[styles.actionText, { color: COLORS.white }]}>Start Ride</Text>
            </TouchableOpacity>
          )}
          {ride.status === 'in_progress' && (
            <>
              <TouchableOpacity style={[styles.actionButton, { backgroundColor: COLORS.primary }]} onPress={completeRide}>
                <Text style={[styles.actionText, { color: COLORS.white }]}>Complete Ride</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.chatButton} onPress={openChat}>
                <Text style={styles.chatText}>Chat</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  panel: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: COLORS.white, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 40,
  },
  statusBadge: {
    alignSelf: 'flex-start', backgroundColor: '#10B98120',
    borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6, marginBottom: 16,
  },
  statusText: { color: '#10B981', fontSize: 14, fontWeight: '600' },
  routeInfo: { marginBottom: 16 },
  routeLabel: { fontSize: 12, color: COLORS.gray[400], marginBottom: 2 },
  routeAddress: { fontSize: 14, color: COLORS.gray[700], marginBottom: 8 },
  actions: { flexDirection: 'row', gap: 12 },
  actionButton: {
    flex: 1, backgroundColor: COLORS.gray[100], borderRadius: 12, padding: 16, alignItems: 'center',
  },
  actionText: { fontSize: 16, fontWeight: '600', color: COLORS.gray[700] },
  chatButton: {
    borderWidth: 2, borderColor: COLORS.primary, borderRadius: 12, padding: 16, alignItems: 'center',
  },
  chatText: { color: COLORS.primary, fontSize: 16, fontWeight: '600' },
});
