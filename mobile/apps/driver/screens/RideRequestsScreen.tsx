import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuth, useSocket, drivers } from '@easyryde/shared';
import { COLORS, formatCurrency } from '@easyryde/shared';
import type { Ride } from '@easyryde/shared';

export default function RideRequestsScreen({ navigation }: any) {
  const { token } = useAuth();
  const { isConnected, on, emit } = useSocket({ token: token || '' });
  const [requests, setRequests] = useState<any[]>([]);

  useEffect(() => {
    if (!isConnected) return;
    const unsub = on('ride:request', (data: any) => {
      setRequests((prev) => {
        if (prev.find((r) => r.rideId === data.rideId)) return prev;
        return [data, ...prev];
      });
    });
    return () => unsub();
  }, [isConnected]);

  const acceptRide = (request: any) => {
    emit('driver:accept-ride', { rideId: request.rideId, riderId: request.riderId });
    setRequests((prev) => prev.filter((r) => r.rideId !== request.rideId));
    navigation.navigate('ActiveRide', { rideId: request.rideId, riderId: request.riderId });
  };

  const dismissRide = (rideId: string) => {
    setRequests((prev) => prev.filter((r) => r.rideId !== rideId));
  };

  const renderRequest = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.distance}>{item.distance?.toFixed(1) || '?'}km away</Text>
        <Text style={styles.category}>{item.category}</Text>
      </View>
      <Text style={styles.pickup}>{item.pickup?.address || 'Pickup location'}</Text>
      <Text style={styles.dropoff}>→ {item.destination?.address || 'Destination'}</Text>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.declineButton} onPress={() => dismissRide(item.rideId)}>
          <Text style={styles.declineText}>Decline</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.acceptButton} onPress={() => acceptRide(item)}>
          <Text style={styles.acceptText}>Accept</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ride Requests</Text>
      <FlatList
        data={requests}
        keyExtractor={(item) => item.rideId}
        renderItem={renderRequest}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No pending requests</Text>}
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
    borderWidth: 1, borderColor: COLORS.gray[100],
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  distance: { fontSize: 14, fontWeight: '600', color: COLORS.primary },
  category: { fontSize: 13, color: COLORS.gray[500], textTransform: 'capitalize' },
  pickup: { fontSize: 15, color: COLORS.gray[700], marginBottom: 4 },
  dropoff: { fontSize: 14, color: COLORS.gray[500], marginBottom: 12 },
  actions: { flexDirection: 'row', gap: 12 },
  declineButton: {
    flex: 1, borderWidth: 1, borderColor: COLORS.gray[300], borderRadius: 10,
    padding: 12, alignItems: 'center',
  },
  declineText: { color: COLORS.gray[600] },
  acceptButton: {
    flex: 1, backgroundColor: '#10B981', borderRadius: 10, padding: 12, alignItems: 'center',
  },
  acceptText: { color: COLORS.white, fontWeight: '600' },
  empty: { textAlign: 'center', color: COLORS.gray[400], marginTop: 40 },
});
