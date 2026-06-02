import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { admin } from '@easyryde/shared';
import { COLORS } from '@easyryde/shared';
import type { User } from '@easyryde/shared';

export default function DriversScreen() {
  const [drivers, setDrivers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadDrivers(); }, []);

  async function loadDrivers() {
    try {
      const data = await admin.drivers({ per_page: '50' });
      setDrivers(data.data);
    } catch {} finally { setLoading(false); }
  }

  const approveDriver = async (id: string) => {
    try {
      await admin.approveDriver(id);
      Alert.alert('Approved', 'Driver approved');
      loadDrivers();
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  const rejectDriver = async (id: string) => {
    try {
      await admin.rejectDriver(id);
      Alert.alert('Rejected', 'Driver rejected');
      loadDrivers();
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Drivers</Text>
      <FlatList
        data={drivers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.name}>{item.name}</Text>
              <View style={[styles.statusDot, { backgroundColor: item.is_active ? '#10B981' : COLORS.gray[300] }]} />
            </View>
            <Text style={styles.email}>{item.email}</Text>
            <Text style={styles.phone}>{item.phone_number}</Text>
            <View style={styles.actions}>
              <TouchableOpacity style={styles.approveButton} onPress={() => approveDriver(item.id)}>
                <Text style={styles.approveText}>Approve</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.rejectButton} onPress={() => rejectDriver(item.id)}>
                <Text style={styles.rejectText}>Reject</Text>
              </TouchableOpacity>
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
  list: { padding: 24 },
  card: { backgroundColor: COLORS.white, borderRadius: 12, padding: 16, marginBottom: 8 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  name: { fontSize: 16, fontWeight: '600', color: COLORS.gray[800] },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  email: { fontSize: 14, color: COLORS.gray[500] },
  phone: { fontSize: 13, color: COLORS.gray[400], marginBottom: 12 },
  actions: { flexDirection: 'row', gap: 12 },
  approveButton: { backgroundColor: '#10B981', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8 },
  approveText: { color: COLORS.white, fontWeight: '600' },
  rejectButton: { borderWidth: 1, borderColor: COLORS.gray[300], borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8 },
  rejectText: { color: COLORS.gray[600] },
});
