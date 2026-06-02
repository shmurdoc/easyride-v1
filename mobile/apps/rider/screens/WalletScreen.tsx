import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { wallet } from '@easyryde/shared';
import { COLORS, formatCurrency, formatDateTime } from '@easyryde/shared';
import type { WalletTransaction } from '@easyryde/shared';

export default function WalletScreen() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWallet();
  }, []);

  async function loadWallet() {
    try {
      const walletData = await wallet.get();
      setBalance(walletData.balance);
      const txData = await wallet.transactions({ per_page: '50' });
      setTransactions(txData.data);
    } catch {} finally {
      setLoading(false);
    }
  }

  const handleDeposit = () => {
    Alert.alert('Deposit', 'PayFast integration coming soon');
  };

  const renderTransaction = ({ item }: { item: WalletTransaction }) => (
    <View style={styles.txRow}>
      <View style={styles.txInfo}>
        <Text style={styles.txDescription}>{item.description || item.type}</Text>
        <Text style={styles.txDate}>{formatDateTime(item.created_at)}</Text>
      </View>
      <Text style={[styles.txAmount, item.type === 'credit' ? styles.txCredit : styles.txDebit]}>
        {item.type === 'credit' ? '+' : '-'}{formatCurrency(item.amount)}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Wallet Balance</Text>
        <Text style={styles.balanceAmount}>{formatCurrency(balance)}</Text>
        <TouchableOpacity style={styles.depositButton} onPress={handleDeposit}>
          <Text style={styles.depositButtonText}>Deposit</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Transactions</Text>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={renderTransaction}
        contentContainerStyle={styles.list}
        ListEmptyComponent={!loading ? <Text style={styles.empty}>No transactions yet</Text> : null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.gray[50] },
  balanceCard: {
    backgroundColor: COLORS.primary, margin: 24, borderRadius: 20, padding: 24, alignItems: 'center',
  },
  balanceLabel: { color: COLORS.primaryLight, fontSize: 14, marginBottom: 4 },
  balanceAmount: { color: COLORS.white, fontSize: 36, fontWeight: 'bold', marginBottom: 16 },
  depositButton: { backgroundColor: COLORS.white, borderRadius: 12, paddingHorizontal: 32, paddingVertical: 12 },
  depositButtonText: { color: COLORS.primary, fontSize: 16, fontWeight: '600' },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: COLORS.gray[700], paddingHorizontal: 24, marginBottom: 8 },
  list: { paddingHorizontal: 24 },
  txRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: COLORS.white, borderRadius: 12, padding: 16, marginBottom: 8,
  },
  txInfo: { flex: 1 },
  txDescription: { fontSize: 14, color: COLORS.gray[700] },
  txDate: { fontSize: 12, color: COLORS.gray[400], marginTop: 2 },
  txAmount: { fontSize: 16, fontWeight: '600' },
  txCredit: { color: COLORS.success },
  txDebit: { color: COLORS.danger },
  empty: { textAlign: 'center', color: COLORS.gray[400], marginTop: 40 },
});
