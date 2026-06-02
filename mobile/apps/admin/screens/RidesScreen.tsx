import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { admin } from '@easyryde/shared';
import { COLORS, formatCurrency, formatDate, RIDE_STATUS_COLORS } from '@easyryde/shared';
import type { Ride } from '@easyryde/shared';

export default function RidesScreen() {
  const [ridesList, setRidesList] = useState<Ride[]>([]);
  const [filter, setFilter] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadRides(); }, [filter]);

  async function loadRides() {
    try {
      const params: Record<string, string> = { per_page: '50' };
      if (filter) params.status = filter;
      const data = await admin.rides(params);
      setRidesList(data.data);
    } catch {} finally { setLoading(false); }
  }

  const filters = [null, 'searching', 'accepted', 'in_progress', 'completed', 'cancelled'];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rides</Text>

      <FlatList
        horizontal
        data={filters}
        keyExtractor={(item) => item || 'all'}
        showsHorizontalScrollIndicator={false}
        style={styles.filters}
        contentContainerStyle={styles.filtersContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.filterChip, filter === item && styles.filterActive]}
            onPress={() => setFilter(item)}
          >
            <Text style={[styles.filterText, filter === item && styles.filterTextActive]}>
              {item || 'All'}
            </Text>
          </TouchableOpacity>
        )}
      />

      <FlatList
        data={ridesList}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.date}>{formatDate(item.created_at)}</Text>
              <View style={[styles.statusBadge, { backgroundColor: RIDE_STATUS_COLORS[item.status] + '20' }]}>
                <Text style={[styles.statusText, { color: RIDE_STATUS_COLORS[item.status] }]}>{item.status}</Text>
              </View>
            </View>
            <Text style={styles.route}>{item.pickup_address} → {item.dropoff_address}</Text>
            <View style={styles.cardFooter}>
              <Text style={styles.rider}>{item.rider?.name || item.rider_id}</Text>
              {item.total_fare && <Text style={styles.fare}>{formatCurrency(item.total_fare)}</Text>}
            </View>
          </View>
        )}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.gray[50] },
  title: { fontSize: 24, fontWeight: 'bold', color: COLORS.gray[800], padding: 24, paddingBottom: 8 },
  filters: { maxHeight: 50 },
  filtersContent: { paddingHorizontal: 24, gap: 8, paddingBottom: 12 },
  filterChip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.gray[200],
  },
  filterActive: { backgroundColor: '#7C3AED', borderColor: '#7C3AED' },
  filterText: { fontSize: 13, color: COLORS.gray[600] },
  filterTextActive: { color: COLORS.white, fontWeight: '600' },
  list: { padding: 24 },
  card: { backgroundColor: COLORS.white, borderRadius: 12, padding: 16, marginBottom: 8 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  date: { fontSize: 13, color: COLORS.gray[400] },
  statusBadge: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 2 },
  statusText: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  route: { fontSize: 14, color: COLORS.gray[700], marginBottom: 8 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  rider: { fontSize: 13, color: COLORS.gray[500] },
  fare: { fontSize: 16, fontWeight: 'bold', color: '#7C3AED' },
});
