import React, { useState, useEffect, useCallback } from 'react';
import { View, TouchableOpacity, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { foodDelivery, COLORS, GRADIENTS, SPACING, RADIUS, Badge, SegmentedControl, GlassCard, GlowButton, GradientText } from '@easyryde/shared';
import type { FoodOrder, DriverNav } from '@easyryde/shared';

export default function FoodDeliveryScreen({ navigation }: { navigation: DriverNav }) {
  const [orders, setOrders] = useState<FoodOrder[]>([]);
  const [filter, setFilter] = useState('available');
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  const loadOrders = useCallback(async () => { try { setOrders(await foodDelivery.driverOrders()); } catch {} }, []);

  useEffect(() => { loadOrders(); const interval = setInterval(loadOrders, 15000); return () => clearInterval(interval); }, [loadOrders]);

  const filteredOrders = orders.filter((o) => {
    if (filter === 'available') return o.status === 'pending' && !o.driver_id;
    if (filter === 'active') return !['delivered', 'cancelled'].includes(o.status) && o.driver_id;
    return o.status === 'delivered';
  });

  return (
    <LinearGradient colors={[COLORS.bgGradientStart, COLORS.bgGradientEnd]} style={{ flex: 1 }}>
      <GradientText colors={GRADIENTS.primary} style={{ fontSize: 26, fontWeight: '700', lineHeight: 34, letterSpacing: -0.3, padding: SPACING.base, paddingBottom: SPACING.sm }}>
        Food Delivery
      </GradientText>
      <SegmentedControl tabs={[{ key: 'available', label: 'Available' }, { key: 'active', label: 'Active' }, { key: 'delivered', label: 'Delivered' }]} selected={filter} onSelect={setFilter} style={{ marginHorizontal: SPACING.base, marginBottom: SPACING.base }} />
      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: SPACING.base }}
        ListEmptyComponent={<GradientText colors={GRADIENTS.primary} style={{ fontSize: 18, fontWeight: '400', lineHeight: 27, textAlign: 'center', marginTop: 40 }}>No orders</GradientText>}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => { if (item.driver_id) navigation.navigate('FoodOrderDetail', { orderId: item.id }); }}>
            <GlassCard glow style={{ marginBottom: SPACING.md }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.md }}>
                <GradientText colors={GRADIENTS.primary} style={{ fontSize: 18, fontWeight: '600', lineHeight: 27 }}>{item.restaurant?.name || 'Restaurant'}</GradientText>
                <Badge label={item.status} variant="default" />
              </View>
              <View style={{ marginBottom: SPACING.md }}>
                {item.items?.slice(0, 3).map((i) => (
                  <GradientText key={i.id} colors={GRADIENTS.primary} style={{ fontSize: 13, fontWeight: '400', lineHeight: 18 }}>{i.quantity}x {i.name}</GradientText>
                ))}
                {(item.items?.length || 0) > 3 && <GradientText colors={GRADIENTS.primary} style={{ fontSize: 11, fontWeight: '400', lineHeight: 14 }}>+{item.items!.length - 3} more</GradientText>}
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <GradientText colors={GRADIENTS.primary} style={{ fontSize: 18, fontWeight: '400', lineHeight: 27 }}>R {item.total_amount.toFixed(2)}</GradientText>
                <GradientText colors={GRADIENTS.primary} style={{ fontSize: 11, fontWeight: '400', lineHeight: 14, flex: 1, textAlign: 'right' }} numberOfLines={1}>{item.delivery_address}</GradientText>
              </View>
              {filter === 'available' && (
                <GlowButton title={acceptingId === item.id ? 'Accepting...' : 'Accept Order'} onPress={async () => { try { setAcceptingId(item.id); await foodDelivery.acceptOrder(item.id); navigation.navigate('FoodOrderDetail', { orderId: item.id }); } catch {} finally { setAcceptingId(null); } }} size="sm" disabled={acceptingId === item.id} style={{ marginTop: SPACING.md }} />
              )}
            </GlassCard>
          </TouchableOpacity>
        )}
      />
    </LinearGradient>
  );
}
