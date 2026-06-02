import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { payments, rides } from '@easyryde/shared';
import { COLORS, formatCurrency, PAYMENT_METHODS } from '@easyryde/shared';

export default function PaymentScreen({ route, navigation }: any) {
  const { rideId } = route.params;
  const [selectedMethod, setSelectedMethod] = useState('cash');
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    setLoading(true);
    try {
      await payments.processRide(rideId, selectedMethod);
      Alert.alert('Payment Successful', 'Thank you for riding with EasyRyde!', [
        { text: 'OK', onPress: () => navigation.navigate('Main') },
      ]);
    } catch (err: any) {
      Alert.alert('Payment Failed', err.message || 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payment</Text>

      <View style={styles.methods}>
        {PAYMENT_METHODS.map((method) => (
          <TouchableOpacity
            key={method.id}
            style={[styles.method, selectedMethod === method.id && styles.methodActive]}
            onPress={() => setSelectedMethod(method.id)}
          >
            <Text style={styles.methodIcon}>{method.icon}</Text>
            <Text style={[styles.methodName, selectedMethod === method.id && styles.methodNameActive]}>
              {method.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.payButton, loading && styles.payButtonDisabled]}
        onPress={handlePay}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={COLORS.white} />
        ) : (
          <Text style={styles.payButtonText}>Confirm Payment</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white, padding: 24 },
  title: { fontSize: 28, fontWeight: 'bold', color: COLORS.gray[800], marginBottom: 32 },
  methods: { gap: 12, marginBottom: 32 },
  method: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderColor: COLORS.gray[200],
    borderRadius: 16, padding: 16,
  },
  methodActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '10' },
  methodIcon: { fontSize: 24, marginRight: 12 },
  methodName: { fontSize: 16, color: COLORS.gray[600] },
  methodNameActive: { color: COLORS.primary, fontWeight: '600' },
  payButton: {
    backgroundColor: COLORS.primary, borderRadius: 16, padding: 18, alignItems: 'center',
  },
  payButtonDisabled: { opacity: 0.5 },
  payButtonText: { color: COLORS.white, fontSize: 18, fontWeight: '600' },
});
