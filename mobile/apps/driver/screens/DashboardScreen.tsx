import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Alert, AppState } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { useAuth, useSocket, drivers, foodDelivery, COLORS, GRADIENTS, SPACING, RADIUS, GlowButton, GlassCard, AnimatedNumber, GradientText } from '@easyryde/shared';
import type { DriverNav } from '@easyryde/shared';

const LOCATION_TASK_NAME = 'easyryde-background-location';

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }: any) => {
  if (error || !data) return;
  const { locations } = data;
  if (!locations?.length) return;
  const { latitude, longitude } = locations[locations.length - 1].coords;
  try { await drivers.updateLocation(latitude, longitude); } catch (err) { console.warn('Failed to update location:', err); }
});

export default function DashboardScreen({ navigation }: { navigation: DriverNav }) {
  const { user, token } = useAuth();
  const { isConnected, emit, on } = useSocket({ token: token || '' });
  const [isOnline, setIsOnline] = useState(false);
  const [earnings, setEarnings] = useState({ today: 0, total: 0, trips: 0 });
  const [pendingFoodOrders, setPendingFoodOrders] = useState(0);
  const [locationWatcher, setLocationWatcher] = useState<Location.LocationSubscription | null>(null);
  const [locationPermission, setLocationPermission] = useState<Location.PermissionStatus | null>(null);
  const appState = useRef(AppState.currentState);
  const isOnlineRef = useRef(false);

  async function loadEarnings() {
    try {
      const data = await drivers.earnings();
      setEarnings({ today: data.today_earnings, total: data.total_earnings, trips: data.total_trips });
    } catch (err) { console.warn('Failed to load earnings:', err); }
  }

  useEffect(() => { loadEarnings(); }, []);

  useEffect(() => {
    if (!isOnline) return;
    const poll = async () => {
      try {
        const orders = await foodDelivery.availableOrders();
        setPendingFoodOrders(orders.filter((o: any) => o.status === 'pending' && !o.driver_id).length);
      } catch (err) { console.warn('Failed to poll food orders:', err); }
    };
    poll();
    const interval = setInterval(poll, 30000);
    return () => clearInterval(interval);
  }, [isOnline]);

  useEffect(() => {
    if (!isConnected) return;
    const unsub = on('ride:request', (data: any) => {
      Alert.alert('New Ride Request', `Rider wants a ride!\nDistance: ${data.distance?.toFixed(1) || '?'}km`, [
        { text: 'Decline', style: 'cancel' },
        { text: 'Accept', onPress: () => { emit('driver:accept-ride', { rideId: data.rideId, riderId: data.riderId }); navigation.navigate('ActiveRide', { rideId: data.rideId, riderId: data.riderId }); } },
      ]);
    });
    return () => unsub();
  }, [isConnected]);

  useEffect(() => {
    checkLocationPermission();
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (appState.current.match(/active|foreground/) && nextAppState === 'background') {
        if (isOnlineRef.current) startBackgroundLocation();
      }
      if (appState.current === 'background' && nextAppState === 'active') {
        if (isOnlineRef.current) {
          stopBackgroundLocation();
          startForegroundLocation();
        }
      }
      appState.current = nextAppState;
    });
    return () => { subscription.remove(); };
  }, []);

  async function checkLocationPermission() {
    const { status } = await Location.getForegroundPermissionsAsync();
    setLocationPermission(status);
  }

  async function requestLocationPermission() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    setLocationPermission(status);
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Location permission is required to go online');
      return false;
    }
    const { status: bgStatus } = await Location.requestBackgroundPermissionsAsync();
    return bgStatus === 'granted';
  }

  async function startForegroundLocation() {
    const watcher = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, distanceInterval: 50 },
      (location) => {
        const { latitude, longitude } = location.coords;
        emit('driver:location-update', { latitude, longitude });
        drivers.updateLocation(latitude, longitude).catch(() => {});
      },
    );
    setLocationWatcher(watcher);
  }

  async function startBackgroundLocation() {
    const { status: bgStatus } = await Location.getBackgroundPermissionsAsync();
    if (bgStatus !== 'granted') {
      await Location.requestBackgroundPermissionsAsync();
    }
    const isTaskDefined = TaskManager.isTaskDefined(LOCATION_TASK_NAME);
    if (isTaskDefined) {
      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.High,
        distanceInterval: 50,
        showsBackgroundLocationIndicator: true,
        foregroundService: {
          notificationTitle: 'EasyRyde',
          notificationBody: 'Location tracking active for ride requests',
        },
      });
    }
  }

  function stopForegroundLocation() {
    locationWatcher?.remove();
    setLocationWatcher(null);
  }

  async function stopBackgroundLocation() {
    const isTaskRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
    if (isTaskRegistered) {
      await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
    }
  }

  async function startLocationTracking() {
    const granted = await requestLocationPermission();
    if (!granted) return;
    await startForegroundLocation();
  }

  function stopLocationTracking() {
    stopForegroundLocation();
    stopBackgroundLocation();
  }

  const toggleOnline = async () => {
    try {
      const result = await drivers.toggleOnline();
      setIsOnline(result.is_online);
      isOnlineRef.current = result.is_online;
      if (result.is_online) {
        startLocationTracking();
      } else {
        stopLocationTracking();
      }
    } catch (err: any) { Alert.alert('Error', err.message); }
  };

  const handleEnableLocation = async () => {
    await requestLocationPermission();
    checkLocationPermission();
  };

  return (
    <LinearGradient colors={[COLORS.bgGradientStart, COLORS.bgGradientEnd]} style={styles.container}>
      <LinearGradient colors={['rgba(212,175,55,0.15)', 'rgba(212,175,55,0)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ paddingTop: 60, paddingBottom: SPACING.lg, paddingHorizontal: SPACING.base }}>
        <GradientText colors={GRADIENTS.primary} style={{ fontSize: 26, fontWeight: '700', lineHeight: 34, letterSpacing: -0.3 }}>
          Hello, {user?.name?.split(' ')[0]}!
        </GradientText>
        <GradientText colors={isConnected ? GRADIENTS.primary : GRADIENTS.primaryDark} style={{ fontSize: 11, fontWeight: '400', lineHeight: 14 }}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </GradientText>
      </LinearGradient>

      <View style={{ flexDirection: 'row', padding: SPACING.base, gap: SPACING.md }}>
        <GlassCard style={{ flex: 1, alignItems: 'center' }} glow>
          <AnimatedNumber value={earnings.today} prefix="R" decimals={2} useGradient style={{ fontSize: 20, fontWeight: '600', lineHeight: 28 }} />
          <GradientText colors={GRADIENTS.primary} style={{ fontSize: 11, fontWeight: '400', lineHeight: 14 }}>Today</GradientText>
        </GlassCard>
        <GlassCard style={{ flex: 1, alignItems: 'center' }} glow>
          <AnimatedNumber value={earnings.total} prefix="R" decimals={2} useGradient style={{ fontSize: 20, fontWeight: '600', lineHeight: 28 }} />
          <GradientText colors={GRADIENTS.primary} style={{ fontSize: 11, fontWeight: '400', lineHeight: 14 }}>Total</GradientText>
        </GlassCard>
        <GlassCard style={{ flex: 1, alignItems: 'center' }} glow>
          <AnimatedNumber value={earnings.trips} useGradient style={{ fontSize: 20, fontWeight: '600', lineHeight: 28 }} />
          <GradientText colors={GRADIENTS.primary} style={{ fontSize: 11, fontWeight: '400', lineHeight: 14 }}>Trips</GradientText>
        </GlassCard>
      </View>

      <View style={{ paddingHorizontal: SPACING.base }}>
        {locationPermission === Location.PermissionStatus.DENIED && (
          <GlowButton title="Enable Location" onPress={handleEnableLocation} size="md" style={{ marginBottom: SPACING.md }} />
        )}
        <LinearGradient
          colors={isOnline ? ['#00D68F', '#00B87A'] : [COLORS.surface, COLORS.surfaceElevated]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.onlineButton, isOnline && styles.onlineButtonActive]}
        >
          <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }} onPress={toggleOnline} activeOpacity={0.8}>
            <View style={[styles.statusDot, isOnline && styles.statusDotActive]} />
            <GradientText colors={isOnline ? ['#1c1c1e', '#1c1c1e'] : GRADIENTS.primary} style={{ fontSize: 20, fontWeight: '600', lineHeight: 28 }}>
              {isOnline ? 'ONLINE' : 'GO ONLINE'}
            </GradientText>
          </TouchableOpacity>
        </LinearGradient>
      </View>

      {isOnline && (
        <TouchableOpacity onPress={() => navigation.navigate('FoodDelivery')}>
          <GlassCard glow style={{ marginHorizontal: SPACING.base, marginTop: SPACING.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <GradientText colors={GRADIENTS.primary} style={{ fontSize: 18, fontWeight: '400', lineHeight: 27 }}>Food Orders Available</GradientText>
            <GradientText colors={GRADIENTS.primary} style={{ fontSize: 20, fontWeight: '600', lineHeight: 28 }}>{pendingFoodOrders}</GradientText>
          </GlassCard>
        </TouchableOpacity>
      )}
      {isOnline && (
        <GradientText colors={GRADIENTS.primary} style={{ fontSize: 18, fontWeight: '400', lineHeight: 27, textAlign: 'center', marginTop: SPACING.md }}>
          Looking for ride requests...
        </GradientText>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  onlineButton: {
    borderRadius: RADIUS.md, padding: 20, overflow: 'hidden',
  },
  onlineButtonActive: {
    shadowColor: COLORS.success,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  statusDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.textMuted, marginRight: SPACING.sm },
  statusDotActive: { backgroundColor: COLORS.bg },
});
