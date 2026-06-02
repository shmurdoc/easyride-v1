import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useAuth, rides, useSocket } from '@easyryde/shared';
import { COLORS, RIDE_STATUS_LABELS, RIDE_STATUS_COLORS, formatCurrency } from '@easyryde/shared';
import type { Ride } from '@easyryde/shared';

export default function RideTrackingScreen({ route, navigation }: any) {
  const { rideId } = route.params;
  const { user, token } = useAuth();
  const { isConnected, on, emit } = useSocket({ token: token || '' });
  const [ride, setRide] = useState<Ride | null>(null);
  const [driverLocation, setDriverLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRide();
  }, [rideId]);

  useEffect(() => {
    if (!isConnected) return;

    const unsub1 = on('ride:accepted', (data: any) => {
      if (data.rideId === rideId) loadRide();
    });
    const unsub2 = on('ride:arrived', (data: any) => {
      if (data.rideId === rideId) loadRide();
    });
    const unsub3 = on('ride:started', (data: any) => {
      if (data.rideId === rideId) loadRide();
    });
    const unsub4 = on('ride:completed', (data: any) => {
      if (data.rideId === rideId) {
        loadRide();
        navigation.navigate('Payment', { rideId });
      }
    });
    const unsub5 = on('ride:cancelled', (data: any) => {
      if (data.rideId === rideId) {
        loadRide();
        Alert.alert('Ride Cancelled', 'Your ride has been cancelled');
        navigation.goBack();
      }
    });
    const unsub6 = on('driver:location', (data: any) => {
      if (data.driverId === ride?.driver_id) {
        setDriverLocation({ lat: data.latitude, lng: data.longitude });
      }
    });

    return () => { unsub1(); unsub2(); unsub3(); unsub4(); unsub5(); unsub6(); };
  }, [isConnected, ride?.driver_id]);

  async function loadRide() {
    try {
      const data = await rides.get(rideId);
      setRide(data);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  }

  const cancelRide = async () => {
    Alert.alert('Cancel Ride', 'Are you sure?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes',
        style: 'destructive',
        onPress: async () => {
          try {
            await rides.cancel(rideId);
            navigation.goBack();
          } catch (err: any) {
            Alert.alert('Error', err.message);
          }
        },
      },
    ]);
  };

  if (loading || !ride) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const statusColor = RIDE_STATUS_COLORS[ride.status] || COLORS.gray[500];

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
        {driverLocation && (
          <Marker coordinate={{ latitude: driverLocation.lat, longitude: driverLocation.lng }} title="Driver" pinColor={COLORS.primary} />
        )}
      </MapView>

      <View style={styles.panel}>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>{RIDE_STATUS_LABELS[ride.status]}</Text>
        </View>

        {ride.driver && (
          <View style={styles.driverInfo}>
            <View style={styles.driverAvatar}>
              <Text style={styles.driverInitial}>{ride.driver.name?.[0]}</Text>
            </View>
            <View style={styles.driverDetails}>
              <Text style={styles.driverName}>{ride.driver.name}</Text>
              <Text style={styles.driverPhone}>{ride.driver.phone_number}</Text>
            </View>
          </View>
        )}

        <View style={styles.routeInfo}>
          <Text style={styles.routeLabel}>From</Text>
          <Text style={styles.routeAddress}>{ride.pickup_address}</Text>
          <Text style={styles.routeLabel}>To</Text>
          <Text style={styles.routeAddress}>{ride.dropoff_address}</Text>
        </View>

        {ride.total_fare && (
          <Text style={styles.fare}>{formatCurrency(ride.total_fare)}</Text>
        )}

        {ride.status === 'searching' && (
          <TouchableOpacity style={styles.cancelButton} onPress={cancelRide}>
            <Text style={styles.cancelButtonText}>Cancel Ride</Text>
          </TouchableOpacity>
        )}

        {ride.status === 'in_progress' && (
          <TouchableOpacity
            style={styles.chatButton}
            onPress={() => navigation.navigate('Chat', { rideId, receiverId: ride.driver_id })}
          >
            <Text style={styles.chatButtonText}>Chat with Driver</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  map: { flex: 1 },
  panel: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: COLORS.white, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 40,
  },
  statusBadge: { alignSelf: 'flex-start', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6, marginBottom: 16 },
  statusText: { fontSize: 14, fontWeight: '600' },
  driverInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  driverAvatar: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  driverInitial: { color: COLORS.white, fontSize: 20, fontWeight: 'bold' },
  driverDetails: { flex: 1 },
  driverName: { fontSize: 16, fontWeight: '600', color: COLORS.gray[800] },
  driverPhone: { fontSize: 14, color: COLORS.gray[500] },
  routeInfo: { marginBottom: 16 },
  routeLabel: { fontSize: 12, color: COLORS.gray[400], marginBottom: 2 },
  routeAddress: { fontSize: 14, color: COLORS.gray[700], marginBottom: 8 },
  fare: { fontSize: 28, fontWeight: 'bold', color: COLORS.primary, textAlign: 'center', marginBottom: 16 },
  cancelButton: {
    borderWidth: 2, borderColor: COLORS.danger, borderRadius: 12,
    padding: 16, alignItems: 'center',
  },
  cancelButtonText: { color: COLORS.danger, fontSize: 16, fontWeight: '600' },
  chatButton: {
    backgroundColor: COLORS.primary, borderRadius: 12, padding: 16, alignItems: 'center',
  },
  chatButtonText: { color: COLORS.white, fontSize: 16, fontWeight: '600' },
});
