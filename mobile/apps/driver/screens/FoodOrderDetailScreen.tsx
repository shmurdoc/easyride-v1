import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { foodDelivery, COLORS, GRADIENTS, SPACING, RADIUS, Badge, LoadingOverlay, GlassCard, GlowButton, GradientText } from '@easyryde/shared';
import type { FoodOrder, DriverRoute } from '@easyryde/shared';

const TRANSITIONS: Record<string, string[]> = { confirmed: ['preparing'], preparing: ['ready'], ready: ['picked_up'], picked_up: ['in_transit'], in_transit: ['delivered'], pending: ['confirmed', 'cancelled'] };
const ACTIONS: Record<string, string> = { confirmed: 'Start Preparing', preparing: 'Mark as Ready', ready: 'Mark as Picked Up', picked_up: 'Start Delivery', in_transit: 'Mark as Delivered' };

export default function FoodOrderDetailScreen({ route }: { route: DriverRoute<'FoodOrderDetail'> }) {
  const { orderId } = route.params;
  const [order, setOrder] = useState<FoodOrder | null>(null);

  const loadOrder = useCallback(async () => { try { setOrder(await foodDelivery.getOrder(orderId)); } catch {} }, [orderId]);

  useEffect(() => { loadOrder(); const interval = setInterval(loadOrder, 10000); return () => clearInterval(interval); }, [loadOrder]);

  const updateStatus = async (newStatus: string) => { try { await foodDelivery.updateOrderStatus(orderId, newStatus); loadOrder(); } catch (err: any) { Alert.alert('Error', err.message || 'Failed'); } };

  if (!order) return <LoadingOverlay />;

  const nextStatus = (TRANSITIONS[order.status] || [])[0];
  const canUpdate = !!nextStatus;

  return (
    <LinearGradient colors={[COLORS.bgGradientStart, COLORS.bgGradientEnd]} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: SPACING.base }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg }}>
          <GradientText colors={GRADIENTS.primary} style={{ fontSize: 26, fontWeight: '700', lineHeight: 34, letterSpacing: -0.3, flex: 1 }}>{order.restaurant?.name}</GradientText>
          <Badge label={order.status} variant={order.status === 'delivered' ? 'success' : order.status === 'cancelled' ? 'error' : 'info'} />
        </View>

        <GlassCard glow style={{ marginBottom: SPACING.base }}>
          <GradientText colors={GRADIENTS.primary} style={{ fontSize: 20, fontWeight: '600', lineHeight: 28, marginBottom: SPACING.md }}>Order Items</GradientText>
          {order.items?.map((item) => (
            <View key={item.id} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: SPACING.xs }}>
              <View style={{ flex: 1 }}>
                <GradientText colors={GRADIENTS.primary} style={{ fontSize: 18, fontWeight: '400', lineHeight: 27 }}>{item.quantity}x {item.name}</GradientText>
                {item.special_instructions && <GradientText colors={GRADIENTS.primary} style={{ fontSize: 13, fontWeight: '400', lineHeight: 18, fontStyle: 'italic' }}>Note: {item.special_instructions}</GradientText>}
              </View>
              <GradientText colors={GRADIENTS.primary} style={{ fontSize: 18, fontWeight: '400', lineHeight: 27 }}>R {item.line_total.toFixed(2)}</GradientText>
            </View>
          ))}
        </GlassCard>

        <GlassCard glow style={{ marginBottom: SPACING.base }}>
          <GradientText colors={GRADIENTS.primary} style={{ fontSize: 20, fontWeight: '600', lineHeight: 28, marginBottom: SPACING.md }}>Delivery Details</GradientText>
          <GradientText colors={GRADIENTS.primary} style={{ fontSize: 18, fontWeight: '400', lineHeight: 27 }}>{order.delivery_address}</GradientText>
          {order.delivery_notes && <GradientText colors={GRADIENTS.primary} style={{ fontSize: 13, fontWeight: '400', lineHeight: 18 }}>{order.delivery_notes}</GradientText>}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: SPACING.md }}>
            <GradientText colors={GRADIENTS.primary} style={{ fontSize: 20, fontWeight: '600', lineHeight: 28 }}>Total</GradientText>
            <GradientText colors={GRADIENTS.primary} style={{ fontSize: 20, fontWeight: '600', lineHeight: 28 }}>R {order.total_amount.toFixed(2)}</GradientText>
          </View>
          <GradientText colors={GRADIENTS.primary} style={{ fontSize: 13, fontWeight: '400', lineHeight: 18 }}>{order.payment_method}</GradientText>
        </GlassCard>

        <GlassCard glow style={{ marginBottom: SPACING.base }}>
          <GradientText colors={GRADIENTS.primary} style={{ fontSize: 20, fontWeight: '600', lineHeight: 28, marginBottom: SPACING.md }}>Customer</GradientText>
          <GradientText colors={GRADIENTS.primary} style={{ fontSize: 18, fontWeight: '400', lineHeight: 27 }}>{order.customer?.name || 'Unknown'}</GradientText>
          <GradientText colors={GRADIENTS.primary} style={{ fontSize: 13, fontWeight: '400', lineHeight: 18 }}>{order.customer?.phone_number || 'N/A'}</GradientText>
        </GlassCard>

        {canUpdate && (
          <GlowButton title={ACTIONS[order.status] || `Move to ${nextStatus}`} onPress={() => { Alert.alert('Update Status', `${ACTIONS[order.status]}?`, [{ text: 'Cancel', style: 'cancel' }, { text: ACTIONS[order.status] || nextStatus, onPress: () => updateStatus(nextStatus) }]); }} size="lg" />
        )}
      </ScrollView>
    </LinearGradient>
  );
}
