import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { payments, COLORS, GRADIENTS, SPACING, RADIUS } from '@easyryde/shared';
import { Typography, GlowButton, GlassCard, GradientText } from '@easyryde/shared';
import type { RiderNav, RiderRoute } from '@easyryde/shared';

export default function PaymentScreen({ route, navigation }: { route: RiderRoute<'Payment'>; navigation: RiderNav }) {
  const { rideId } = route.params;
  const [selectedMethod, setSelectedMethod] = useState('cash');
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    setLoading(true);
    try {
      await payments.processRide(rideId, selectedMethod);
      Alert.alert('Payment Successful', 'Thank you for riding with EasyRyde!', [{ text: 'OK', onPress: () => navigation.navigate('Main') }]);
    } catch (err: any) { Alert.alert('Payment Failed', err.message || 'Please try again');
    } finally { setLoading(false); }
  };

  return (
    <LinearGradient colors={GRADIENTS.background as unknown as string[]} style={styles.container}>
      <GradientText
        colors={GRADIENTS.primary}
        style={{ fontSize: 26, fontWeight: '700', marginBottom: SPACING.xl }}
      >
        Payment
      </GradientText>

      <View style={{ gap: SPACING.md, marginBottom: SPACING.xl }}>
        {[{ id: 'cash', name: 'Cash' }, { id: 'wallet', name: 'Wallet' }, { id: 'payfast', name: 'PayFast' }, { id: 'ozow', name: 'Ozow EFT' }].map(({ id, name }) => {
          const isSelected = selectedMethod === id;
          return (
            <TouchableOpacity key={id} onPress={() => setSelectedMethod(id)}>
              <GlassCard padding={SPACING.base} glow={isSelected}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {isSelected && (
                    <LinearGradient
                      colors={GRADIENTS.primary as unknown as string[]}
                      style={styles.selectionIndicator}
                    />
                  )}
                  <Typography
                    variant="body"
                    color={isSelected ? COLORS.primary : COLORS.text}
                    style={{ fontWeight: isSelected ? '600' : '400', marginLeft: isSelected ? SPACING.sm : 0 }}
                  >
                    {name}
                  </Typography>
                </View>
              </GlassCard>
            </TouchableOpacity>
          );
        })}
      </View>

      <GlowButton title={loading ? 'Processing...' : 'Confirm Payment'} onPress={handlePay} disabled={loading} size="lg" />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: SPACING.base },
  selectionIndicator: {
    width: 4, height: 24, borderRadius: 2,
    marginRight: SPACING.sm,
  },
});
