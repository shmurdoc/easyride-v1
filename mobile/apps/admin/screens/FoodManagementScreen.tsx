import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Alert, Modal } from 'react-native';
import { api, COLORS, formatCurrency } from '@easyryde/shared';
import type { Restaurant, FoodOrder } from '@easyryde/shared';

export default function FoodManagementScreen() {
  const [tab, setTab] = useState<'restaurants' | 'orders'>('restaurants');
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [orders, setOrders] = useState<FoodOrder[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [deliveryFee, setDeliveryFee] = useState('');
  const [minimumOrder, setMinimumOrder] = useState('');

  const loadRestaurants = useCallback(async () => {
    try {
      const data = await api.get<{ data: Restaurant[] }>('/admin/food/restaurants');
      setRestaurants(data.data);
    } catch {}
  }, []);

  const loadOrders = useCallback(async () => {
    try {
      const data = await api.get<FoodOrder[]>('/admin/food/orders');
      setOrders(data);
    } catch {}
  }, []);

  useEffect(() => {
    if (tab === 'restaurants') loadRestaurants();
    else loadOrders();
  }, [tab, loadRestaurants, loadOrders]);

  async function createRestaurant() {
    if (!name.trim() || !address.trim()) {
      Alert.alert('Error', 'Name and address are required');
      return;
    }
    try {
      await api.post('/admin/food/restaurants', {
        name,
        address,
        delivery_fee: deliveryFee ? parseFloat(deliveryFee) : 0,
        minimum_order: minimumOrder ? parseFloat(minimumOrder) : 0,
        is_active: true,
      });
      setShowCreateModal(false);
      setName('');
      setAddress('');
      setDeliveryFee('');
      setMinimumOrder('');
      loadRestaurants();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to create restaurant');
    }
  }

  const toggleActive = async (id: string, current: boolean) => {
    try {
      await api.put(`/admin/food/restaurants/${id}`, { is_active: !current });
      loadRestaurants();
    } catch {}
  };

  const renderRestaurant = ({ item }: { item: Restaurant }) => (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        <View style={styles.cardInfo}>
          <Text style={styles.cardName}>{item.name}</Text>
          <Text style={styles.cardAddress}>{item.address}</Text>
          <Text style={styles.cardMeta}>
            {formatCurrency(item.delivery_fee)} fee • Min {formatCurrency(item.minimum_order)}
          </Text>
        </View>
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={[styles.statusButton, item.is_active ? styles.activeButton : styles.inactiveButton]}
            onPress={() => toggleActive(item.id, item.is_active)}
          >
            <Text style={[styles.statusButtonText, { color: item.is_active ? '#10B981' : '#EF4444' }]}>
              {item.is_active ? 'Active' : 'Inactive'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderOrder = ({ item }: { item: FoodOrder }) => (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        <View style={styles.cardInfo}>
          <Text style={styles.cardName}>{item.restaurant?.name}</Text>
          <Text style={styles.cardAddress}>{item.delivery_address}</Text>
          <Text style={styles.cardMeta}>
            {formatCurrency(item.total_amount)} • {item.status}
          </Text>
        </View>
        <View>
          <Text style={styles.orderCustomer}>{item.customer?.name || 'N/A'}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Food Management</Text>

      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, tab === 'restaurants' && styles.tabActive]}
          onPress={() => setTab('restaurants')}
        >
          <Text style={[styles.tabText, tab === 'restaurants' && styles.tabTextActive]}>Restaurants</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'orders' && styles.tabActive]}
          onPress={() => setTab('orders')}
        >
          <Text style={[styles.tabText, tab === 'orders' && styles.tabTextActive]}>Orders</Text>
        </TouchableOpacity>
      </View>

      {tab === 'restaurants' && (
        <FlatList
          data={restaurants}
          keyExtractor={(item) => item.id}
          renderItem={renderRestaurant}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>No restaurants</Text>}
          ListHeaderComponent={
            <TouchableOpacity style={styles.createButton} onPress={() => setShowCreateModal(true)}>
              <Text style={styles.createButtonText}>+ Add Restaurant</Text>
            </TouchableOpacity>
          }
        />
      )}

      {tab === 'orders' && (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={renderOrder}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>No food orders</Text>}
        />
      )}

      <Modal visible={showCreateModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Add Restaurant</Text>
            <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} />
            <TextInput style={styles.input} placeholder="Address" value={address} onChangeText={setAddress} />
            <TextInput style={styles.input} placeholder="Delivery Fee (ZAR)" value={deliveryFee} onChangeText={setDeliveryFee} keyboardType="decimal-pad" />
            <TextInput style={styles.input} placeholder="Minimum Order (ZAR)" value={minimumOrder} onChangeText={setMinimumOrder} keyboardType="decimal-pad" />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelModalButton} onPress={() => setShowCreateModal(false)}>
                <Text style={styles.cancelModalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.createModalButton} onPress={createRestaurant}>
                <Text style={styles.createModalButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.gray[50] },
  title: { fontSize: 24, fontWeight: 'bold', color: COLORS.gray[800], padding: 24, paddingBottom: 8 },
  tabRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 24, marginBottom: 16 },
  tab: { flex: 1, padding: 10, borderRadius: 8, backgroundColor: COLORS.gray[100], alignItems: 'center' },
  tabActive: { backgroundColor: '#7C3AED' },
  tabText: { fontSize: 14, fontWeight: '500', color: COLORS.gray[600] },
  tabTextActive: { color: COLORS.white, fontWeight: '600' },
  list: { padding: 24, paddingTop: 0 },
  createButton: {
    backgroundColor: '#7C3AED', borderRadius: 12, padding: 12, alignItems: 'center', marginBottom: 12,
  },
  createButtonText: { color: COLORS.white, fontSize: 15, fontWeight: '600' },
  card: { backgroundColor: COLORS.white, borderRadius: 12, padding: 16, marginBottom: 8 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 16, fontWeight: '600', color: COLORS.gray[800] },
  cardAddress: { fontSize: 13, color: COLORS.gray[400], marginTop: 2 },
  cardMeta: { fontSize: 13, color: COLORS.gray[500], marginTop: 4 },
  cardActions: { marginLeft: 12 },
  statusButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: COLORS.gray[100] },
  activeButton: {},
  inactiveButton: {},
  statusButtonText: { fontSize: 13, fontWeight: '600' },
  orderCustomer: { fontSize: 14, color: COLORS.gray[600] },
  empty: { textAlign: 'center', color: COLORS.gray[400], marginTop: 40 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modal: { backgroundColor: COLORS.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.gray[800], marginBottom: 16 },
  input: {
    borderWidth: 1, borderColor: COLORS.gray[200], borderRadius: 12,
    padding: 14, fontSize: 16, marginBottom: 12, backgroundColor: COLORS.gray[50],
  },
  modalButtons: { flexDirection: 'row', gap: 12, marginTop: 8 },
  cancelModalButton: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: COLORS.gray[100], alignItems: 'center' },
  cancelModalButtonText: { fontSize: 16, fontWeight: '600', color: COLORS.gray[600] },
  createModalButton: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: '#7C3AED', alignItems: 'center' },
  createModalButtonText: { fontSize: 16, fontWeight: '600', color: COLORS.white },
});
