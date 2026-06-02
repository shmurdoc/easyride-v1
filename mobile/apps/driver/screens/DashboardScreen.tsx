import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as Location from 'expo-location';
import { useAuth, useSocket, drivers } from '@easyryde/shared';
import { COLORS, formatCurrency } from '@easyryde/shared';

export default function DashboardScreen({ navigation }: any) {
  const { user, token } = useAuth();
  const { isConnected, emit, on } = useSocket({ token: token || '' });
  const [isOnline, setIsOnline] = useState(false);
  const [earnings, setEarnings] = useState({ today: 0, total: 0, trips: 0 });
  const [locationWatcher, setLocationWatcher] = useState<Location.LocationSubscription | null>(null);

  useEffect(() => {
    loadEarnings();
  }, []);

  useEffect(() => {
    if (!isConnected) return;
    const unsub = on('ride:request', (data: any) => {
      Alert.alert(
        'New Ride Request',
        `Rider wants a ride!\nDistance: ${data.distance?.toFixed(1) || '?'}km`,
        [
          { text: 'Decline', style: 'cancel' },
          {
            text: 'Accept',
            onPress: () => {
              emit('driver:accept-ride', { rideId: data.rideId, riderId: data.riderId });
              navigation.navigate('ActiveRide', { rideId: data.rideId, riderId: data.riderId });
            },
          },
        ],
      );
    });
    return () => unsub();
  }, [isConnected]);

  async function loadEarnings() {
    try {
      const data = await drivers.earnings();
      setEarnings({
        today: data.today_earnings,
        total: data.total_earnings,
        trips: data.total_trips,
      });
    } catch {}
  }

  const toggleOnline = async () => {
    try {
      const result = await drivers.toggleOnline();
      setIsOnline(result.is_online);

      if (result.is_online) {
        startLocationTracking();
      } else {
        stopLocationTracking();
      }
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  async function startLocationTracking() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Location permission is required');
      return;
    }

    const watcher = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, distanceInterval: 50 },
      (location) => {
        emit('driver:location-update', {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      },
    );
    setLocationWatcher(watcher);
  }

  function stopLocationTracking() {
    locationWatcher?.remove();
    setLocationWatcher(null);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0]}!</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{formatCurrency(earnings.today)}</Text>
          <Text style={styles.statLabel}>Today</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{formatCurrency(earnings.total)}</Text>
          <Text style={styles.statLabel}>Total Earnings</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{earnings.trips}</Text>
          <Text style={styles.statLabel}>Total Trips</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.onlineButton, isOnline && styles.onlineButtonActive]}
        onPress={toggleOnline}
      >
        <View style={[styles.statusDot, isOnline && styles.statusDotActive]} />
        <Text style={[styles.onlineText, isOnline && styles.onlineTextActive]}>
          {isOnline ? 'ONLINE' : 'GO ONLINE'}
        </Text>
      </TouchableOpacity>

      {isOnline && (
        <Text style={styles.searchingText}>Looking for ride requests...</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.gray[50] },
  header: { padding: 24, paddingBottom: 8 },
  greeting: { fontSize: 24, fontWeight: 'bold', color: COLORS.gray[800] },
  statsRow: { flexDirection: 'row', padding: 24, gap: 12 },
  statCard: {
    flex: 1, backgroundColor: COLORS.white, borderRadius: 16, padding: 16, alignItems: 'center',
  },
  statValue: { fontSize: 18, fontWeight: 'bold', color: COLORS.gray[800] },
  statLabel: { fontSize: 12, color: COLORS.gray[400], marginTop: 4 },
  onlineButton: {
    margin: 24, borderRadius: 16, padding: 20, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.gray[200],
  },
  onlineButtonActive: { backgroundColor: '#10B981' },
  statusDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.gray[500], marginRight: 8 },
  statusDotActive: { backgroundColor: COLORS.white },
  onlineText: { fontSize: 18, fontWeight: 'bold', color: COLORS.gray[600] },
  onlineTextActive: { color: COLORS.white },
  searchingText: { textAlign: 'center', color: COLORS.gray[400], fontSize: 14 },
});
