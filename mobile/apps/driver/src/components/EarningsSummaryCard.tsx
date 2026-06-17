import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface EarningsSummaryCardProps {
  label: string;
  value: string;
  trend?: 'up' | 'down';
  trendValue?: string;
}

export function EarningsSummaryCard({ label, value, trend, trendValue }: EarningsSummaryCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      {trend && trendValue && (
        <Text style={[styles.trend, trend === 'up' ? styles.up : styles.down]}>
          {trend === 'up' ? '↑' : '↓'} {trendValue}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, flex: 1, margin: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 },
  label: { fontSize: 12, color: '#6B7280', marginBottom: 4 },
  value: { fontSize: 20, fontWeight: '700', color: '#1E3A5F' },
  trend: { fontSize: 12, marginTop: 4 },
  up: { color: '#10B981' },
  down: { color: '#EF4444' },
});
