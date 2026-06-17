import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth, COLORS, SPACING, RADIUS, SHADOWS } from '@easyryde/shared';
import { GlowButton } from '@easyryde/shared';
import type { RiderNav } from '@easyryde/shared';

const PAYMENT_METHODS = [
  { id: 'wallet', name: 'Wallet Balance', icon: 'wallet-outline', detail: 'R 0.00' },
  { id: 'visa', name: 'Visa •••• 4242', icon: 'card-outline', detail: 'Default' },
  { id: 'ozow', name: 'Ozow EFT', icon: 'swap-horizontal-outline', detail: 'Linked' },
] as const;

const TRANSACTIONS = [
  { id: '1', label: 'Ride to Zaporizke Hwy', amount: '-R 85.00', time: '2h ago', type: 'debit' },
  { id: '2', label: 'Top-up via Visa', amount: '+R 500.00', time: '1d ago', type: 'credit' },
  { id: '3', label: 'Ride to Mechnykova St', amount: '-R 120.00', time: '3d ago', type: 'debit' },
];

export default function WalletScreen() {
  const navigation = useNavigation<RiderNav>();
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Wallet</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <Text style={styles.balanceAmount}>R 295.00</Text>
          <Text style={styles.balanceSub}>Available for rides and deliveries</Text>
          <View style={styles.balanceActions}>
            <GlowButton
              title="Add Funds"
              onPress={() => Alert.alert('Add Funds', 'Top-up flow coming soon')}
              size="sm"
              style={{ flex: 1 }}
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Payment Methods</Text>
        {PAYMENT_METHODS.map((method) => (
          <TouchableOpacity key={method.id} style={styles.methodRow}>
            <View style={styles.methodIcon}>
              <Ionicons name={method.icon as any} size={20} color={COLORS.primary} />
            </View>
            <View style={styles.methodInfo}>
              <Text style={styles.methodName}>{method.name}</Text>
              <Text style={styles.methodDetail}>{method.detail}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textDim} />
          </TouchableOpacity>
        ))}

        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        {TRANSACTIONS.map((tx) => (
          <View key={tx.id} style={styles.txRow}>
            <View style={[styles.txIcon, tx.type === 'credit' && styles.txIconCredit]}>
              <Ionicons
                name={tx.type === 'credit' ? 'arrow-down' : 'arrow-up'}
                size={16}
                color={tx.type === 'credit' ? COLORS.success : COLORS.textMuted}
              />
            </View>
            <View style={styles.txInfo}>
              <Text style={styles.txLabel}>{tx.label}</Text>
              <Text style={styles.txTime}>{tx.time}</Text>
            </View>
            <Text style={[styles.txAmount, tx.type === 'credit' && styles.txAmountCredit]}>
              {tx.amount}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.base,
    paddingTop: SPACING.lg + 40,
    paddingBottom: SPACING.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    padding: SPACING.base,
    paddingBottom: 40,
  },
  balanceCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    ...SHADOWS.moderate,
  },
  balanceLabel: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: SPACING.xs,
  },
  balanceAmount: {
    color: COLORS.text,
    fontSize: 36,
    fontWeight: '800',
    marginBottom: SPACING.xs,
  },
  balanceSub: {
    color: COLORS.textDim,
    fontSize: 13,
    marginBottom: SPACING.lg,
  },
  balanceActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  sectionTitle: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: SPACING.md,
    marginTop: SPACING.sm,
  },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  methodIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  methodInfo: {
    flex: 1,
  },
  methodName: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '500',
  },
  methodDetail: {
    color: COLORS.textDim,
    fontSize: 12,
    marginTop: 2,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  txIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  txIconCredit: {
    backgroundColor: COLORS.successGlow,
  },
  txInfo: {
    flex: 1,
  },
  txLabel: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '500',
  },
  txTime: {
    color: COLORS.textDim,
    fontSize: 12,
    marginTop: 2,
  },
  txAmount: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
  txAmountCredit: {
    color: COLORS.success,
  },
});
