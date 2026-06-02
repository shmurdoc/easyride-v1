import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { drivers } from '@easyryde/shared';
import { COLORS, formatCurrency, formatDateTime } from '@easyryde/shared';
import type { WalletTransaction } from '@easyryde/shared';

export default function EarningsScreen() {
  const [earnings, setEarnings] = useState({ total: 0, today: 0, pending: 0, trips: 0 });
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);

  useEffect(() => {
    loadEarnings();
  }, []);

  async function loadEarnings() {
    try {
      const data = await drivers.earnings();
      setEarnings({
        total: data.total_earnings,
        today: data.today_earnings,
        pending: data.pending_payout,
        trips: data.total_trips,
      });
      setTransactions(data.recent_transactions);
    } catch {}
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Earnings</Text>

      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: '#10B981' }]}>
          <Text style={styles.statValueWhite}>{formatCurrency(earnings.today)}</Text>
          <Text style={styles.statLabelWhite}>Today</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{formatCurrency(earnings.total)}</Text>
          <Text style={styles.statLabel}>All Time</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{formatCurrency(earnings.pending)}</Text>
          <Text style={styles.statLabel}>Pending Payout</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{earnings.trips}</Text>
          <Text style={styles.statLabel}>Total Trips</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Recent Transactions</Text>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.txRow}>
            <View style={styles.txInfo}>
              <Text style={styles.txDesc}>{item.description || item.type}</Text>
              <Text style={styles.txDate}>{formatDateTime(item.created_at)}</Text>
            </View>
            <Text style={[styles.txAmount, item.type === 'credit' ? styles.txCredit : styles.txDebit]}>
              {item.type === 'credit' ? '+' : '-'}{formatCurrency(item.amount)}
            </Text>
          </View>
        )}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.gray[50] },
  title: { fontSize: 24, fontWeight: 'bold', color: COLORS.gray[800], padding: 24, paddingBottom: 8 },
  statsRow: { flexDirection: 'row', padding: 24, paddingBottom: 0, gap: 12 },
  statCard: {
    flex: 1, backgroundColor: COLORS.white, borderRadius: 16, padding: 16, alignItems: 'center',
  },
  statValue: { fontSize: 18, fontWeight: 'bold', color: COLORS.gray[800] },
  statValueWhite: { fontSize: 18, fontWeight: 'bold', color: COLORS.white },
  statLabel: { fontSize: 12, color: COLORS.gray[400], marginTop: 4 },
  statLabelWhite: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: COLORS.gray[700], padding: 24, paddingBottom: 8 },
  list: { paddingHorizontal: 24 },
  txRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: COLORS.white, borderRadius: 12, padding: 16, marginBottom: 8,
  },
  txInfo: { flex: 1 },
  txDesc: { fontSize: 14, color: COLORS.gray[700] },
  txDate: { fontSize: 12, color: COLORS.gray[400], marginTop: 2 },
  txAmount: { fontSize: 16, fontWeight: '600' },
  txCredit: { color: '#10B981' },
  txDebit: { color: COLORS.danger },
});
