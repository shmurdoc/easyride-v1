import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useAuth, rides, COLORS, MAP_REGION, RIDE_CATEGORIES } from '@easyryde/shared';

export default function HomeScreen({ navigation }: any) {
  const { user } = useAuth();
  const [pickup, setPickup] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [dropoff, setDropoff] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [pickupText, setPickupText] = useState('');
  const [dropoffText, setDropoffText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('standard');
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  async function getCurrentLocation() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required');
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      setPickup({
        lat: location.coords.latitude,
        lng: location.coords.longitude,
        address: 'Current Location',
      });
      setPickupText('Current Location');
    } catch {
      setPickup({ lat: MAP_REGION.latitude, lng: MAP_REGION.longitude, address: 'Phalaborwa' });
      setPickupText('Phalaborwa');
    }
  }

  const handleBookRide = async () => {
    if (!pickup || !dropoff) {
      Alert.alert('Error', 'Please select pickup and dropoff locations');
      return;
    }

    setSearching(true);
    try {
      const ride = await rides.create({
        category: selectedCategory,
        pickup_latitude: pickup.lat,
        pickup_longitude: pickup.lng,
        pickup_address: pickup.address,
        dropoff_latitude: dropoff.lat,
        dropoff_longitude: dropoff.lng,
        dropoff_address: dropoff.address,
        payment_method: 'cash',
      });
      navigation.navigate('RideTracking', { rideId: ride.id });
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to book ride');
    } finally {
      setSearching(false);
    }
  };

  return (
    <View style={styles.container}>
      <MapView style={styles.map} initialRegion={MAP_REGION}>
        {pickup && <Marker coordinate={{ latitude: pickup.lat, longitude: pickup.lng }} title="Pickup" pinColor={COLORS.success} />}
        {dropoff && <Marker coordinate={{ latitude: dropoff.lat, longitude: dropoff.lng }} title="Dropoff" pinColor={COLORS.danger} />}
      </MapView>

      <View style={styles.panel}>
        <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0]}!</Text>

        <TextInput
          style={styles.input}
          placeholder="Pickup location"
          value={pickupText}
          onChangeText={setPickupText}
        />

        <TextInput
          style={styles.input}
          placeholder="Where to?"
          value={dropoffText}
          onChangeText={setDropoffText}
        />

        <View style={styles.categories}>
          {RIDE_CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.category, selectedCategory === cat.id && styles.categoryActive]}
              onPress={() => setSelectedCategory(cat.id)}
            >
              <Text style={styles.categoryIcon}>{cat.icon}</Text>
              <Text style={[styles.categoryName, selectedCategory === cat.id && styles.categoryNameActive]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.foodButton}
          onPress={() => navigation.navigate('RestaurantList')}
        >
          <Text style={styles.foodButtonText}>🍔 Order Food Delivery</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.bookButton, (!pickup || !dropoff || searching) && styles.bookButtonDisabled]}
          onPress={handleBookRide}
          disabled={!pickup || !dropoff || searching}
        >
          <Text style={styles.bookButtonText}>
            {searching ? 'Finding Driver...' : 'Book Ride'}
          </Text>
        </TouchableOpacity>
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
  greeting: { fontSize: 20, fontWeight: 'bold', color: COLORS.gray[800], marginBottom: 16 },
  input: {
    borderWidth: 1, borderColor: COLORS.gray[200], borderRadius: 12,
    padding: 14, fontSize: 16, marginBottom: 12, backgroundColor: COLORS.gray[50],
  },
  categories: { flexDirection: 'row', marginBottom: 16, gap: 8 },
  category: {
    flex: 1, alignItems: 'center', padding: 12, borderRadius: 12,
    borderWidth: 2, borderColor: COLORS.gray[200], backgroundColor: COLORS.gray[50],
  },
  categoryActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '10' },
  categoryIcon: { fontSize: 24, marginBottom: 4 },
  categoryName: { fontSize: 12, color: COLORS.gray[500] },
  categoryNameActive: { color: COLORS.primary, fontWeight: '600' },
  bookButton: {
    backgroundColor: COLORS.primary, borderRadius: 12, padding: 16, alignItems: 'center',
  },
  bookButtonDisabled: { opacity: 0.5 },
  bookButtonText: { color: COLORS.white, fontSize: 18, fontWeight: '600' },
  foodButton: {
    backgroundColor: '#FFF7ED', borderRadius: 12, padding: 14, alignItems: 'center',
    marginBottom: 12, borderWidth: 1, borderColor: '#FED7AA',
  },
  foodButtonText: { color: '#EA580C', fontSize: 16, fontWeight: '600' },
});
