import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { drivers } from '@easyryde/shared';
import { COLORS, formatCurrency, formatDate, RIDE_STATUS_COLORS } from '@easyryde/shared';
import type { Ride } from '@easyryde/shared';

export default function TripHistoryScreen() {
  const [trips, setTrips] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrips();
  }, []);

  async function loadTrips() {
    try {
      const data = await drivers.trips({ per_page: '50' });
      setTrips(data.data);
    } catch {} finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Trip History</Text>
      <FlatList
        data={trips}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.date}>{formatDate(item.created_at)}</Text>
              <View style={[styles.dot, { backgroundColor: RIDE_STATUS_COLORS[item.status] }]} />
            </View>
            <Text style={styles.route}>{item.pickup_address} → {item.dropoff_address}</Text>
            <View style={styles.cardFooter}>
              <Text style={styles.rider}>{item.rider?.name || 'Rider'}</Text>
              {item.total_fare && <Text style={styles.fare}>{formatCurrency(item.total_fare)}</Text>}
            </View>
          </View>
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={!loading ? <Text style={styles.empty}>No trips yet</Text> : null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.gray[50] },
  title: { fontSize: 24, fontWeight: 'bold', color: COLORS.gray[800], padding: 24, paddingBottom: 8 },
  list: { padding: 24 },
  card: {
    backgroundColor: COLORS.white, borderRadius: 16, padding: 16, marginBottom: 12,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  date: { fontSize: 13, color: COLORS.gray[400] },
  dot: { width: 10, height: 10, borderRadius: 5 },
  route: { fontSize: 14, color: COLORS.gray[700], marginBottom: 8 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  rider: { fontSize: 13, color: COLORS.gray[500] },
  fare: { fontSize: 16, fontWeight: 'bold', color: '#10B981' },
  empty: { textAlign: 'center', color: COLORS.gray[400], marginTop: 40 },
});
