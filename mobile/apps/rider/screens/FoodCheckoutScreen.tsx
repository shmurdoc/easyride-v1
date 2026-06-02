import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Alert, ScrollView } from 'react-native';
import { foodDelivery, PAYMENT_METHODS } from '@easyryde/shared';
import { COLORS, formatCurrency } from '@easyryde/shared';
import type { CartItem } from '@easyryde/shared';

export default function FoodCheckoutScreen({ route, navigation }: any) {
  const { restaurantId, restaurantName, cart, subtotal, deliveryFee } = route.params;
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryLatitude, setDeliveryLatitude] = useState<number | null>(null);
  const [deliveryLongitude, setDeliveryLongitude] = useState<number | null>(null);
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [tip, setTip] = useState(0);
  const [loading, setLoading] = useState(false);

  const serviceFee = Math.round(subtotal * 0.05 * 100) / 100;
  const total = subtotal + deliveryFee + serviceFee + tip;

  const tipOptions = [0, 10, 20, 30];

  async function placeOrder() {
    if (!deliveryAddress.trim()) {
      Alert.alert('Missing Address', 'Please enter a delivery address');
      return;
    }
    if (deliveryLatitude == null || deliveryLongitude == null) {
      Alert.alert('Missing Location', 'Please pick a delivery location on the map');
      return;
    }
    setLoading(true);
    try {
      const order = await foodDelivery.createOrder(restaurantId, {
        items: cart.map((item: CartItem) => ({
          menu_item_id: item.menuItem.id,
          quantity: item.quantity,
          special_instructions: item.specialInstructions,
        })),
        delivery_address: deliveryAddress,
        delivery_latitude: deliveryLatitude,
        delivery_longitude: deliveryLongitude,
        delivery_notes: deliveryNotes || undefined,
        payment_method: paymentMethod,
        tip_amount: tip,
      });
      navigation.navigate('FoodOrderTracking', { orderId: order.id });
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Checkout</Text>
      <Text style={styles.restaurantName}>{restaurantName}</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Summary</Text>
        {cart.map((item: CartItem) => (
          <View key={item.menuItem.id} style={styles.orderItem}>
            <Text style={styles.orderItemName}>{item.quantity}x {item.menuItem.name}</Text>
            <Text style={styles.orderItemPrice}>{formatCurrency(item.menuItem.price * item.quantity)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Delivery Address</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your delivery address"
          value={deliveryAddress}
          onChangeText={setDeliveryAddress}
          multiline
        />
        <TextInput
          style={styles.input}
          placeholder="Delivery notes (optional)"
          value={deliveryNotes}
          onChangeText={setDeliveryNotes}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tip</Text>
        <View style={styles.tipOptions}>
          {tipOptions.map((amount) => (
            <TouchableOpacity
              key={amount}
              style={[styles.tipButton, tip === amount && styles.tipButtonActive]}
              onPress={() => setTip(amount)}
            >
              <Text style={[styles.tipButtonText, tip === amount && styles.tipButtonTextActive]}>
                {amount === 0 ? 'No tip' : formatCurrency(amount)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Method</Text>
        <View style={styles.paymentMethods}>
          {PAYMENT_METHODS.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[styles.paymentButton, paymentMethod === method.id && styles.paymentButtonActive]}
              onPress={() => setPaymentMethod(method.id)}
            >
              <Text style={[styles.paymentButtonText, paymentMethod === method.id && styles.paymentButtonTextActive]}>
                {method.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.totals}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Subtotal</Text>
          <Text style={styles.totalValue}>{formatCurrency(subtotal)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Delivery fee</Text>
          <Text style={styles.totalValue}>{formatCurrency(deliveryFee)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Service fee</Text>
          <Text style={styles.totalValue}>{formatCurrency(serviceFee)}</Text>
        </View>
        {tip > 0 && (
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tip</Text>
            <Text style={styles.totalValue}>{formatCurrency(tip)}</Text>
          </View>
        )}
        <View style={[styles.totalRow, styles.totalRowFinal]}>
          <Text style={styles.totalLabelFinal}>Total</Text>
          <Text style={styles.totalValueFinal}>{formatCurrency(total)}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.placeOrderButton, loading && styles.placeOrderButtonDisabled]}
        onPress={placeOrder}
        disabled={loading}
      >
        <Text style={styles.placeOrderButtonText}>
          {loading ? 'Placing Order...' : `Place Order • ${formatCurrency(total)}`}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.gray[50] },
  content: { padding: 24 },
  title: { fontSize: 24, fontWeight: 'bold', color: COLORS.gray[800] },
  restaurantName: { fontSize: 14, color: COLORS.gray[500], marginTop: 4, marginBottom: 24 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: COLORS.gray[700], marginBottom: 12 },
  orderItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  orderItemName: { fontSize: 14, color: COLORS.gray[600] },
  orderItemPrice: { fontSize: 14, fontWeight: '500', color: COLORS.gray[700] },
  input: {
    backgroundColor: COLORS.white, borderRadius: 12, padding: 12, fontSize: 16,
    borderWidth: 1, borderColor: COLORS.gray[200], marginBottom: 8,
  },
  tipOptions: { flexDirection: 'row', gap: 8 },
  tipButton: {
    flex: 1, padding: 12, borderRadius: 12, backgroundColor: COLORS.white,
    borderWidth: 1, borderColor: COLORS.gray[200], alignItems: 'center',
  },
  tipButtonActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  tipButtonText: { fontSize: 14, color: COLORS.gray[600] },
  tipButtonTextActive: { color: COLORS.white },
  paymentMethods: { gap: 8 },
  paymentButton: {
    padding: 16, borderRadius: 12, backgroundColor: COLORS.white,
    borderWidth: 1, borderColor: COLORS.gray[200],
  },
  paymentButtonActive: { backgroundColor: COLORS.primary + '10', borderColor: COLORS.primary },
  paymentButtonText: { fontSize: 16, color: COLORS.gray[600] },
  paymentButtonTextActive: { color: COLORS.primary, fontWeight: '600' },
  totals: { backgroundColor: COLORS.white, borderRadius: 16, padding: 20, marginBottom: 24 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  totalLabel: { fontSize: 14, color: COLORS.gray[500] },
  totalValue: { fontSize: 14, color: COLORS.gray[700] },
  totalRowFinal: { borderTopWidth: 1, borderTopColor: COLORS.gray[100], marginTop: 8, paddingTop: 12 },
  totalLabelFinal: { fontSize: 16, fontWeight: '700', color: COLORS.gray[800] },
  totalValueFinal: { fontSize: 16, fontWeight: '700', color: COLORS.primary },
  placeOrderButton: {
    backgroundColor: COLORS.primary, borderRadius: 16, padding: 16, alignItems: 'center',
  },
  placeOrderButtonDisabled: { opacity: 0.6 },
  placeOrderButtonText: { color: COLORS.white, fontSize: 16, fontWeight: '600' },
});
