import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Alert, Animated, TouchableOpacity, Text, ScrollView } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, rides, COLORS, MAP_REGION, RIDE_CATEGORIES, SPACING, RADIUS } from '@easyryde/shared';
import { GlowButton, CategoryTile } from '@easyryde/shared';
import type { RiderNav, RiderMainTabParamList } from '@easyryde/shared';
import type { RouteProp } from '@react-navigation/native';

const CATEGORIES = [
  { id: 'ride', label: 'Ride', icon: 'car-outline' as const, badge: 'Promo', route: 'BookRide' as const },
  { id: 'travel', label: 'Travel', icon: 'airplane-outline' as const, badge: null, route: null },
] as const;

const RECENT_LOCATIONS = [
  { id: '1', name: 'Zaporizke Hwy, 40', subtitle: 'Phalaborwa, Limpopo' },
  { id: '2', name: 'Mechnykova St, 19', subtitle: 'Phalaborwa, Limpopo' },
];

export default function HomeScreen({ navigation, route }: { navigation: RiderNav; route: RouteProp<RiderMainTabParamList, 'Home'> }) {
  const { user } = useAuth();
  const [pickup, setPickup] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [dropoff, setDropoff] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('ride');
  const [searching, setSearching] = useState(false);
  const dropoffScale = useRef(new Animated.Value(0)).current;

  useEffect(() => { getCurrentLocation(); }, []);

  useEffect(() => {
    const dropoffParam = route.params?.dropoff;
    if (dropoffParam) {
      setDropoff({ lat: dropoffParam.lat, lng: dropoffParam.lng, address: dropoffParam.name });
      navigation.setParams({ dropoff: undefined } as any);
    }
  }, [route.params?.dropoff]);

  async function getCurrentLocation() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') { Alert.alert('Permission denied', 'Location permission is required'); return; }
      const location = await Location.getCurrentPositionAsync({});
      setPickup({ lat: location.coords.latitude, lng: location.coords.longitude, address: 'Current Location' });
    } catch {
      setPickup({ lat: MAP_REGION.latitude, lng: MAP_REGION.longitude, address: 'Phalaborwa' });
    }
  }

  const handleCategoryPress = (cat: typeof CATEGORIES[number]) => {
    setSelectedCategory(cat.id);
    if (cat.route === 'BookRide') {
      navigation.navigate('BookRide');
    } else if (cat.route) {
      navigation.navigate(cat.route as any);
    } else {
      Alert.alert('Coming Soon', `${cat.label} feature is coming soon!`);
    }
  };

  const handleBookRide = async () => {
    if (!pickup || !dropoff) { Alert.alert('Error', 'Please select pickup and dropoff locations'); return; }
    setSearching(true);
    try {
      const ride = await rides.create({
        category: selectedCategory,
        pickup_lat: pickup.lat,
        pickup_lng: pickup.lng,
        pickup_address: pickup.address,
        dropoff_lat: dropoff.lat,
        dropoff_lng: dropoff.lng,
        dropoff_address: dropoff.address,
        payment_method: 'cash',
      });
      navigation.navigate('RideTracking', { rideId: ride.id });
    } catch (err: any) { Alert.alert('Error', err.message || 'Failed to book ride');
    } finally { setSearching(false); }
  };

  useEffect(() => {
    if (dropoff) {
      Animated.spring(dropoffScale, { toValue: 1, useNativeDriver: true, speed: 6, bounciness: 12 }).start();
    } else {
      dropoffScale.setValue(0);
    }
  }, [dropoff]);

  const selectedFare = RIDE_CATEGORIES.find(c => c.id === selectedCategory);
  const estimatedFare = selectedFare ? selectedFare.baseFare : 35;

  return (
    <View style={styles.container}>
      <MapView style={styles.map} initialRegion={MAP_REGION}>
        {pickup && <Marker coordinate={{ latitude: pickup.lat, longitude: pickup.lng }} title="Pickup" pinColor={COLORS.success} />}
        {dropoff && (
          <Marker coordinate={{ latitude: dropoff.lat, longitude: dropoff.lng }} title="Dropoff" pinColor={COLORS.error}>
            <Animated.View style={{ transform: [{ scale: dropoffScale }] }}>
              <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.error, justifyContent: 'center', alignItems: 'center' }}>
                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.bg }} />
              </View>
            </Animated.View>
          </Marker>
        )}
      </MapView>

      <LinearGradient
        colors={['rgba(10,10,10,0.9)', 'rgba(10,10,10,0.4)', 'transparent']}
        style={styles.topGradient}
        pointerEvents="none"
      />

      <View style={styles.panelWrapper}>
        <LinearGradient
          colors={['transparent', 'rgba(42,31,20,0.6)', 'rgba(42,31,20,0.98)']}
          style={styles.bottomGradient}
          pointerEvents="none"
        />
        <ScrollView style={styles.panel} contentContainerStyle={styles.panelContent}>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((cat) => (
              <CategoryTile
                key={cat.id}
                label={cat.label}
                icon={cat.icon}
                badge={cat.badge || undefined}
                selected={selectedCategory === cat.id}
                onPress={() => handleCategoryPress(cat)}
              />
            ))}
          </View>

          <TouchableOpacity style={styles.searchBar} onPress={() => navigation.navigate('BookRide')}>
            <Ionicons name="search" size={18} color={COLORS.textMuted} />
            <Text style={styles.searchText}>Where to?</Text>
            <View style={styles.nowPill}>
              <Ionicons name="time-outline" size={14} color={COLORS.text} />
              <Text style={styles.nowText}>Now</Text>
              <Ionicons name="chevron-down" size={12} color={COLORS.text} />
            </View>
          </TouchableOpacity>

          <View style={styles.recentSection}>
            {RECENT_LOCATIONS.map((loc) => (
              <TouchableOpacity key={loc.id} style={styles.recentItem}>
                <View style={styles.recentIcon}>
                  <Ionicons name="time-outline" size={16} color={COLORS.textMuted} />
                </View>
                <View style={styles.recentText}>
                  <Text style={styles.recentName}>{loc.name}</Text>
                  <Text style={styles.recentSub}>{loc.subtitle}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <GlowButton
            title={searching ? 'Finding Driver...' : 'Book Ride'}
            onPress={handleBookRide}
            disabled={!pickup || !dropoff || searching}
            size="lg"
            style={{ marginTop: SPACING.md }}
          />
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  map: { flex: 1 },
  topGradient: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 120,
  },
  bottomGradient: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 300,
  },
  panelWrapper: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
  },
  panel: {
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
  },
  panelContent: {
    padding: SPACING.base,
    paddingBottom: 40,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.base,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.glass,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderRadius: RADIUS.lg,
    padding: 14,
    marginBottom: SPACING.base,
    gap: SPACING.sm,
  },
  searchText: {
    flex: 1,
    color: COLORS.textMuted,
    fontSize: 15,
  },
  nowPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    gap: 4,
  },
  nowText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '600',
  },
  recentSection: {
    gap: SPACING.sm,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  recentIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recentText: {
    flex: 1,
  },
  recentName: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '500',
  },
  recentSub: {
    color: COLORS.textDim,
    fontSize: 12,
    marginTop: 2,
  },
});
