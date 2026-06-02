import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { foodDelivery, COLORS, formatCurrency, useSocket } from '@easyryde/shared';
import type { FoodOrder } from '@easyryde/shared';

const ORDER_STATUS_COLORS: Record<string, string> = {
  pending: '#F59E0B',
  confirmed: '#3B82F6',
  preparing: '#8B5CF6',
  ready: '#10B981',
  picked_up: '#6366F1',
  in_transit: '#F59E0B',
  delivered: '#10B981',
  cancelled: '#EF4444',
};

export default function FoodDeliveryScreen({ navigation }: any) {
  const [orders, setOrders] = useState<FoodOrder[]>([]);
  const [filter, setFilter] = useState<'available' | 'active' | 'delivered'>('available');
  const { socket } = useSocket();

  const loadOrders = useCallback(async () => {
    try {
      const data = await foodDelivery.driverOrders();
      setOrders(data);
    } catch {}
  }, []);

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 15000);
    return () => clearInterval(interval);
  }, [loadOrders]);

  useEffect(() => {
    if (!socket) return;
    socket.on('food:new-order', () => { loadOrders(); });
    socket.on('food:status-update', (data: { order_id: string }) => {
      loadOrders();
    });
    return () => {
      socket.off('food:new-order');
      socket.off('food:status-update');
    };
  }, [socket, loadOrders]);

  const filteredOrders = orders.filter((o) => {
    if (filter === 'available') return o.status === 'pending' && !o.driver_id;
    if (filter === 'active') return !['delivered', 'cancelled'].includes(o.status) && o.driver_id;
    return o.status === 'delivered';
  });

  const acceptOrder = async (orderId: string) => {
    try {
      await foodDelivery.updateOrderStatus(orderId, 'confirmed');
      navigation.navigate('FoodOrderDetail', { orderId });
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to accept order');
    }
  };

  const renderOrder = ({ item }: { item: FoodOrder }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => {
        if (item.driver_id) navigation.navigate('FoodOrderDetail', { orderId: item.id });
      }}
    >
      <View style={styles.orderHeader}>
        <Text style={styles.restaurantName}>{item.restaurant?.name || 'Restaurant'}</Text>
        <View style={[styles.statusBadge, { backgroundColor: (ORDER_STATUS_COLORS[item.status] || '#6B7280') + '20' }]}>
          <Text style={[styles.statusText, { color: ORDER_STATUS_COLORS[item.status] || '#6B7280' }]}>
            {item.status}
          </Text>
        </View>
      </View>

      <View style={styles.itemsSection}>
        {item.items?.slice(0, 3).map((i) => (
          <Text key={i.id} style={styles.itemName}>{i.quantity}x {i.name}</Text>
        ))}
        {(item.items?.length || 0) > 3 && (
          <Text style={styles.moreItems}>+{item.items!.length - 3} more items</Text>
        )}
      </View>

      <View style={styles.orderFooter}>
        <Text style={styles.orderAmount}>{formatCurrency(item.total_amount)}</Text>
        <Text style={styles.deliveryAddress} numberOfLines={1}>{item.delivery_address}</Text>
      </View>

      {filter === 'available' && (
        <TouchableOpacity style={styles.acceptButton} onPress={() => acceptOrder(item.id)}>
          <Text style={styles.acceptButtonText}>Accept Order</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Food Delivery</Text>

      <View style={styles.filterRow}>
        {(['available', 'active', 'delivered'] as const).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterButton, filter === f && styles.filterButtonActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f === 'available' ? 'Available' : f === 'active' ? 'Active' : 'Delivered'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.id}
        renderItem={renderOrder}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No food delivery orders</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.gray[50] },
  title: { fontSize: 24, fontWeight: 'bold', color: COLORS.gray[800], padding: 24, paddingBottom: 8 },
  filterRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 24, marginBottom: 16 },
  filterButton: {
    flex: 1, padding: 8, borderRadius: 8, alignItems: 'center',
    backgroundColor: COLORS.gray[100],
  },
  filterButtonActive: { backgroundColor: '#10B981' },
  filterText: { fontSize: 13, color: COLORS.gray[600], fontWeight: '500' },
  filterTextActive: { color: COLORS.white },
  list: { padding: 24, paddingTop: 0 },
  orderCard: {
    backgroundColor: COLORS.white, borderRadius: 16, padding: 16, marginBottom: 12,
  },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  restaurantName: { fontSize: 16, fontWeight: '600', color: COLORS.gray[800] },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  itemsSection: { marginBottom: 12 },
  itemName: { fontSize: 14, color: COLORS.gray[600], marginBottom: 2 },
  moreItems: { fontSize: 13, color: COLORS.gray[400], marginTop: 2 },
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderAmount: { fontSize: 16, fontWeight: '700', color: COLORS.gray[800] },
  deliveryAddress: { fontSize: 13, color: COLORS.gray[400], flex: 1, marginLeft: 12, textAlign: 'right' },
  acceptButton: {
    marginTop: 12, backgroundColor: '#10B981', borderRadius: 12, padding: 12, alignItems: 'center',
  },
  acceptButtonText: { color: COLORS.white, fontSize: 16, fontWeight: '600' },
  empty: { textAlign: 'center', color: COLORS.gray[400], marginTop: 40 },
});
