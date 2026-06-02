import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { foodDelivery, COLORS, formatCurrency, useSocket } from '@easyryde/shared';
import type { FoodOrder } from '@easyryde/shared';

const STATUS_TRANSITIONS: Record<string, string[]> = {
  confirmed: ['preparing'],
  preparing: ['ready'],
  ready: ['picked_up'],
  picked_up: ['in_transit'],
  in_transit: ['delivered'],
  pending: ['confirmed', 'cancelled'],
};

const STATUS_ACTIONS: Record<string, string> = {
  confirmed: 'Start Preparing',
  preparing: 'Mark as Ready',
  ready: 'Mark as Picked Up',
  picked_up: 'Start Delivery',
  in_transit: 'Mark as Delivered',
};

export default function FoodOrderDetailScreen({ route, navigation }: any) {
  const { orderId } = route.params;
  const [order, setOrder] = useState<FoodOrder | null>(null);
  const { socket } = useSocket();

  const loadOrder = useCallback(async () => {
    try { setOrder(await foodDelivery.getOrder(orderId)); }
    catch {}
  }, [orderId]);

  useEffect(() => {
    loadOrder();
    const interval = setInterval(loadOrder, 10000);
    return () => clearInterval(interval);
  }, [loadOrder]);

  useEffect(() => {
    if (!socket) return;
    socket.emit('join', { channel: `food-order.${orderId}` });
    socket.on('food:status-update', (data: { order_id: string }) => {
      if (data.order_id === orderId) loadOrder();
    });
    return () => {
      socket.off('food:status-update');
      socket.emit('leave', { channel: `food-order.${orderId}` });
    };
  }, [socket, orderId, loadOrder]);

  const updateStatus = async (newStatus: string) => {
    try {
      await foodDelivery.updateOrderStatus(orderId, newStatus);
      loadOrder();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update status');
    }
  };

  const nextStatus = (STATUS_TRANSITIONS[order?.status || ''] || [])[0];
  const canUpdate = !!nextStatus;

  if (!order) {
    return (
      <View style={styles.container}>
        <Text style={styles.loading}>Loading order...</Text>
      </View>
    );
  }

  const isDelivered = order.status === 'delivered';
  const isCancelled = order.status === 'cancelled';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.restaurantName}>{order.restaurant?.name}</Text>
        <View style={[styles.statusBadge, isCancelled && styles.statusBadgeCancelled, isDelivered && styles.statusBadgeDelivered]}>
          <Text style={styles.statusText}>{order.status}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Items</Text>
        {order.items?.map((item) => (
          <View key={item.id} style={styles.itemRow}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.quantity}x {item.name}</Text>
              {item.special_instructions && (
                <Text style={styles.itemNote}>Note: {item.special_instructions}</Text>
              )}
            </View>
            <Text style={styles.itemPrice}>{formatCurrency(item.line_total)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Delivery Details</Text>
        <Text style={styles.detailText}>📍 {order.delivery_address}</Text>
        {order.delivery_notes && <Text style={styles.detailText}>📝 {order.delivery_notes}</Text>}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{formatCurrency(order.total_amount)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Payment</Text>
          <Text style={styles.totalValue}>{order.payment_method}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Customer</Text>
        <Text style={styles.detailText}>👤 {order.customer?.name || 'Unknown'}</Text>
        <Text style={styles.detailText}>📞 {order.customer?.phone_number || 'N/A'}</Text>
      </View>

      {canUpdate && (
        <TouchableOpacity
          style={styles.updateButton}
          onPress={() => {
            Alert.alert('Update Status', `${STATUS_ACTIONS[order.status] || 'Update to'} "${nextStatus}"?`, [
              { text: 'Cancel', style: 'cancel' },
              { text: STATUS_ACTIONS[order.status] || nextStatus, onPress: () => updateStatus(nextStatus) },
            ]);
          }}
        >
          <Text style={styles.updateButtonText}>{STATUS_ACTIONS[order.status] || `Move to ${nextStatus}`}</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.gray[50] },
  content: { padding: 24 },
  loading: { textAlign: 'center', marginTop: 40, color: COLORS.gray[400] },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  restaurantName: { fontSize: 22, fontWeight: 'bold', color: COLORS.gray[800] },
  statusBadge: { backgroundColor: '#10B98120', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  statusBadgeCancelled: { backgroundColor: '#EF444420' },
  statusBadgeDelivered: { backgroundColor: '#10B98120' },
  statusText: { fontSize: 14, fontWeight: '600', color: '#10B981', textTransform: 'capitalize' },
  section: { backgroundColor: COLORS.white, borderRadius: 16, padding: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: COLORS.gray[700], marginBottom: 12 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: 6 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 15, color: COLORS.gray[700] },
  itemNote: { fontSize: 12, color: COLORS.gray[400], fontStyle: 'italic', marginTop: 2 },
  itemPrice: { fontSize: 15, fontWeight: '500', color: COLORS.gray[700] },
  detailText: { fontSize: 14, color: COLORS.gray[600], marginBottom: 4 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, marginTop: 4 },
  totalLabel: { fontSize: 14, color: COLORS.gray[500] },
  totalValue: { fontSize: 14, fontWeight: '500', color: COLORS.gray[700] },
  updateButton: {
    backgroundColor: '#10B981', borderRadius: 16, padding: 16, alignItems: 'center',
  },
  updateButtonText: { color: COLORS.white, fontSize: 16, fontWeight: '600' },
});
