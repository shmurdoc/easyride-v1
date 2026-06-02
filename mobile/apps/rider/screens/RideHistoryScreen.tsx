import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { rides } from '@easyryde/shared';
import { COLORS, formatCurrency, formatDate, RIDE_STATUS_COLORS } from '@easyryde/shared';
import type { Ride } from '@easyryde/shared';

export default function RideHistoryScreen({ navigation }: any) {
  const [rideHistory, setRideHistory] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    try {
      const data = await rides.list({ per_page: '50' });
      setRideHistory(data.data);
    } catch {} finally {
      setLoading(false);
    }
  }

  const renderRide = ({ item }: { item: Ride }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('RideTracking', { rideId: item.id })}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardDate}>{formatDate(item.created_at)}</Text>
        <View style={[styles.statusDot, { backgroundColor: RIDE_STATUS_COLORS[item.status] }]} />
      </View>
      <Text style={styles.route}>{item.pickup_address} → {item.dropoff_address}</Text>
      <View style={styles.cardFooter}>
        <Text style={styles.category}>{item.category}</Text>
        {item.total_fare && <Text style={styles.fare}>{formatCurrency(item.total_fare)}</Text>}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ride History</Text>
      <FlatList
        data={rideHistory}
        keyExtractor={(item) => item.id}
        renderItem={renderRide}
        contentContainerStyle={styles.list}
        ListEmptyComponent={!loading ? <Text style={styles.empty}>No rides yet</Text> : null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.gray[50] },
  title: { fontSize: 28, fontWeight: 'bold', color: COLORS.gray[800], padding: 24, paddingBottom: 8 },
  list: { padding: 24 },
  card: {
    backgroundColor: COLORS.white, borderRadius: 16, padding: 16, marginBottom: 12,
    shadowColor: COLORS.black, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardDate: { fontSize: 13, color: COLORS.gray[400] },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  route: { fontSize: 15, color: COLORS.gray[700], marginBottom: 8 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  category: { fontSize: 13, color: COLORS.gray[500], textTransform: 'capitalize' },
  fare: { fontSize: 18, fontWeight: 'bold', color: COLORS.primary },
  empty: { textAlign: 'center', color: COLORS.gray[400], marginTop: 40 },
});
