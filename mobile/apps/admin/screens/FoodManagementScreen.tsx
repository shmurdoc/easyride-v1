import React, { useState, useEffect, useCallback } from 'react';
import { FlatList, TouchableOpacity, StyleSheet, Alert, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { api, COLORS, GRADIENTS, SPACING, RADIUS } from '@easyryde/shared';
import { Typography } from '@easyryde/shared';
import { SegmentedControl } from '@easyryde/shared';
import { Modal } from '@easyryde/shared';
import { Input } from '@easyryde/shared';
import { GlowButton } from '@easyryde/shared';
import { GlassCard } from '@easyryde/shared';
import { GradientText } from '@easyryde/shared';
import type { Restaurant, FoodOrder } from '@easyryde/shared';

export default function FoodManagementScreen() {
  const [tab, setTab] = useState('restaurants');
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [orders, setOrders] = useState<FoodOrder[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [deliveryFee, setDeliveryFee] = useState('');
  const [minimumOrder, setMinimumOrder] = useState('');

  const loadRestaurants = useCallback(async () => { try { const data = await api.get<any>('/admin/food/restaurants'); setRestaurants(data.data); } catch (err) { console.warn('Failed to load restaurants:', err); } }, []);
  const loadOrders = useCallback(async () => { try { const data = await api.get<any>('/admin/food/orders'); setOrders(data); } catch (err) { console.warn('Failed to load orders:', err); } }, []);

  useEffect(() => { if (tab === 'restaurants') loadRestaurants(); else loadOrders(); }, [tab, loadRestaurants, loadOrders]);

  const createRestaurant = async () => {
    if (!name.trim() || !address.trim()) { Alert.alert('Error', 'Name and address are required'); return; }
    try { await api.post('/admin/food/restaurants', { name, address, delivery_fee: deliveryFee ? parseFloat(deliveryFee) : 0, minimum_order: minimumOrder ? parseFloat(minimumOrder) : 0, is_active: true }); setShowCreate(false); setName(''); setAddress(''); setDeliveryFee(''); setMinimumOrder(''); loadRestaurants(); } catch (err: any) { Alert.alert('Error', err.message); }
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <LinearGradient colors={['rgba(212,175,55,0.1)', 'rgba(0,0,0,0)']} style={styles.header}>
        <Typography variant="h2">Food Management</Typography>
      </LinearGradient>
      <View style={styles.tabContainer}>
        <SegmentedControl tabs={[{ key: 'restaurants', label: 'Restaurants' }, { key: 'orders', label: 'Orders' }]} selected={tab} onSelect={setTab} style={{ marginHorizontal: SPACING.base, marginBottom: SPACING.base }} />
      </View>

      {tab === 'restaurants' && (
        <FlatList
          data={restaurants}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: SPACING.base }}
          ListEmptyComponent={<Typography variant="body" color={COLORS.textMuted} style={{ textAlign: 'center', marginTop: 40 }}>No restaurants</Typography>}
          ListHeaderComponent={<GlowButton title="+ Add Restaurant" onPress={() => setShowCreate(true)} size="md" style={{ marginBottom: SPACING.base }} />}
          renderItem={({ item }) => (
            <GlassCard glow glowColor={item.is_active ? COLORS.successGlow : COLORS.primaryGlow} style={{ marginBottom: SPACING.sm }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ flex: 1 }}>
                  <GradientText colors={GRADIENTS.primary} style={styles.restaurantName}>{item.name}</GradientText>
                  <Typography variant="small" color={COLORS.textMuted}>{item.address}</Typography>
                  <Typography variant="xs" color={COLORS.textDim} style={{ marginTop: SPACING.xs }}>
                    <GradientText colors={GRADIENTS.primary}>R {item.delivery_fee.toFixed(2)} fee</GradientText> · Min R {item.min_order_amount.toFixed(2)}
                  </Typography>
                </View>
                <TouchableOpacity onPress={async () => { try { await api.put(`/admin/food/restaurants/${item.id}`, { is_active: !item.is_active }); loadRestaurants(); } catch (err) { console.warn('Failed to toggle restaurant:', err); } }} style={[styles.statusBadge, { backgroundColor: item.is_active ? COLORS.successGlow : COLORS.errorGlow }]}>
                  <Typography variant="xs" color={item.is_active ? COLORS.success : COLORS.error} style={{ fontWeight: '600' }}>{item.is_active ? 'Active' : 'Inactive'}</Typography>
                </TouchableOpacity>
              </View>
            </GlassCard>
          )}
        />
      )}

      {tab === 'orders' && (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: SPACING.base }}
          ListEmptyComponent={<Typography variant="body" color={COLORS.textMuted} style={{ textAlign: 'center', marginTop: 40 }}>No food orders</Typography>}
          renderItem={({ item }) => (
            <GlassCard style={{ marginBottom: SPACING.sm }}>
              <GradientText colors={GRADIENTS.primary} style={styles.restaurantName}>{item.restaurant?.name}</GradientText>
              <Typography variant="small" color={COLORS.textMuted}>{item.delivery_address}</Typography>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: SPACING.xs }}>
                <GradientText colors={GRADIENTS.primary} style={styles.orderAmount}>R {item.total_amount.toFixed(2)}</GradientText>
                <Typography variant="xs" color={COLORS.textMuted}>{item.status}</Typography>
              </View>
              <Typography variant="xs" color={COLORS.textDim}>{item.customer?.name || 'N/A'}</Typography>
            </GlassCard>
          )}
        />
      )}

      <Modal visible={showCreate} onClose={() => setShowCreate(false)} title="Add Restaurant">
        <Input label="Name" value={name} onChangeText={setName} style={{ marginBottom: SPACING.md }} />
        <Input label="Address" value={address} onChangeText={setAddress} style={{ marginBottom: SPACING.md }} />
        <Input label="Delivery Fee (ZAR)" value={deliveryFee} onChangeText={setDeliveryFee} keyboardType="numeric" style={{ marginBottom: SPACING.md }} />
        <Input label="Minimum Order (ZAR)" value={minimumOrder} onChangeText={setMinimumOrder} keyboardType="numeric" style={{ marginBottom: SPACING.lg }} />
        <GlowButton title="Create" onPress={createRestaurant} />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: SPACING['2xl'], paddingBottom: SPACING.sm, paddingHorizontal: SPACING.base },
  tabContainer: { paddingHorizontal: SPACING.base },
  restaurantName: { fontSize: 16, fontWeight: '600', marginBottom: SPACING.xs },
  orderAmount: { fontSize: 16, fontWeight: '700' },
  statusBadge: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.sm, height: 32, alignSelf: 'flex-start' },
});
