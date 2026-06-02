import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { foodDelivery, COLORS, formatCurrency, useSocket } from '@easyryde/shared';
import type { FoodOrder } from '@easyryde/shared';

const STATUS_STEPS = [
  'pending',
  'confirmed',
  'preparing',
  'ready',
  'picked_up',
  'in_transit',
  'delivered',
];

const STATUS_LABELS: Record<string, string> = {
  pending: 'Order Placed',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  ready: 'Ready for Pickup',
  picked_up: 'Picked Up',
  in_transit: 'On the Way',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const STATUS_ICONS: Record<string, string> = {
  pending: '📋',
  confirmed: '✅',
  preparing: '👨‍🍳',
  ready: '📦',
  picked_up: '🚶',
  in_transit: '🚗',
  delivered: '🎉',
  cancelled: '❌',
};

export default function FoodOrderTrackingScreen({ route, navigation }: any) {
  const { orderId } = route.params;
  const [order, setOrder] = useState<FoodOrder | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
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
    socket.on('food:status-update', (data: { order_id: string; status: string }) => {
      if (data.order_id === orderId) loadOrder();
    });
    return () => {
      socket.off('food:status-update');
      socket.emit('leave', { channel: `food-order.${orderId}` });
    };
  }, [socket, orderId, loadOrder]);

  useEffect(() => {
    if (order) {
      const idx = STATUS_STEPS.indexOf(order.status);
      setCurrentStep(idx >= 0 ? idx : 0);
    }
  }, [order]);

  async function cancelOrder() {
    Alert.alert('Cancel Order', 'Are you sure you want to cancel this order?', [
      { text: 'No', style: 'cancel' },
      { text: 'Yes, Cancel', style: 'destructive', onPress: async () => {
        try {
          await foodDelivery.cancelOrder(orderId);
          loadOrder();
        } catch {}
      }},
    ]);
  }

  if (!order) {
    return (
      <View style={styles.container}>
        <Text style={styles.loading}>Loading order details...</Text>
      </View>
    );
  }

  const isCancelled = order.status === 'cancelled';
  const isDelivered = order.status === 'delivered';
  const canCancel = !isCancelled && !isDelivered && currentStep < 2;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.orderIcon}>{STATUS_ICONS[order.status] || '📋'}</Text>
        <Text style={styles.statusText}>{STATUS_LABELS[order.status] || order.status}</Text>
        <Text style={styles.restaurantName}>{order.restaurant?.name}</Text>
      </View>

      <View style={styles.progressSection}>
        <Text style={styles.sectionTitle}>Order Progress</Text>
        {STATUS_STEPS.slice(0, isCancelled ? currentStep + 1 : undefined).map((step, idx) => (
          <View key={step} style={styles.stepRow}>
            <View style={[styles.stepDot, idx <= currentStep && !isCancelled && styles.stepDotActive, isCancelled && idx === currentStep && styles.stepDotCancelled]}>
              {idx < currentStep && !isCancelled && <Text style={styles.stepCheck}>✓</Text>}
              {isCancelled && idx === currentStep && <Text style={styles.stepCheck}>✗</Text>}
            </View>
            <View style={styles.stepLine}>
              <Text style={[styles.stepLabel, idx <= currentStep && styles.stepLabelActive]}>{STATUS_LABELS[step]}</Text>
              <Text style={styles.stepDesc}>{STATUS_ICONS[step]} {STATUS_LABELS[step]}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.detailsSection}>
        <Text style={styles.sectionTitle}>Order Details</Text>
        {order.items?.map((item) => (
          <View key={item.id} style={styles.itemRow}>
            <Text style={styles.itemName}>{item.quantity}x {item.name}</Text>
            <Text style={styles.itemPrice}>{formatCurrency(item.line_total)}</Text>
          </View>
        ))}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{formatCurrency(order.total_amount)}</Text>
        </View>
        <Text style={styles.deliveryAddress}>📍 {order.delivery_address}</Text>
      </View>

      {canCancel && (
        <TouchableOpacity style={styles.cancelButton} onPress={cancelOrder}>
          <Text style={styles.cancelButtonText}>Cancel Order</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.gray[50] },
  loading: { textAlign: 'center', marginTop: 40, color: COLORS.gray[400] },
  header: {
    backgroundColor: COLORS.white, padding: 24, alignItems: 'center',
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
  },
  orderIcon: { fontSize: 48 },
  statusText: { fontSize: 20, fontWeight: 'bold', color: COLORS.gray[800], marginTop: 8 },
  restaurantName: { fontSize: 14, color: COLORS.gray[500], marginTop: 4 },
  progressSection: { padding: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: COLORS.gray[700], marginBottom: 16 },
  stepRow: { flexDirection: 'row', marginBottom: 4 },
  stepDot: {
    width: 24, height: 24, borderRadius: 12, backgroundColor: COLORS.gray[200],
    justifyContent: 'center', alignItems: 'center', marginRight: 12, marginTop: 2,
  },
  stepDotActive: { backgroundColor: COLORS.primary },
  stepDotCancelled: { backgroundColor: '#EF4444' },
  stepCheck: { color: COLORS.white, fontSize: 12, fontWeight: 'bold' },
  stepLine: { flex: 1, paddingBottom: 12, borderLeftWidth: 2, borderLeftColor: COLORS.gray[200], paddingLeft: 12, marginLeft: -1 },
  stepLabel: { fontSize: 14, color: COLORS.gray[400] },
  stepLabelActive: { color: COLORS.gray[800], fontWeight: '500' },
  stepDesc: { fontSize: 12, color: COLORS.gray[400] },
  detailsSection: { backgroundColor: COLORS.white, margin: 24, marginTop: 0, borderRadius: 16, padding: 20 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  itemName: { fontSize: 14, color: COLORS.gray[600] },
  itemPrice: { fontSize: 14, color: COLORS.gray[700] },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: COLORS.gray[100], marginTop: 8, paddingTop: 12 },
  totalLabel: { fontSize: 16, fontWeight: '700', color: COLORS.gray[800] },
  totalValue: { fontSize: 16, fontWeight: '700', color: COLORS.primary },
  deliveryAddress: { fontSize: 13, color: COLORS.gray[400], marginTop: 12 },
  cancelButton: {
    margin: 24, marginTop: 0, borderRadius: 16, padding: 16, alignItems: 'center',
    backgroundColor: '#FEE2E2',
  },
  cancelButtonText: { color: '#EF4444', fontSize: 16, fontWeight: '600' },
});
