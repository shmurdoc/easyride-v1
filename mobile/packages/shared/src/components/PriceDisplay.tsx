import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import { useTheme } from '../theme';
import { SPACING, COLORS } from '../constants';

interface PriceDisplayProps {
  amount: number;
  currency?: string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

export function PriceDisplay({ amount, label, size = 'md', style }: PriceDisplayProps) {
  const { colors, typography } = useTheme();
  const formatted = `R ${amount.toFixed(2)}`;

  const sizes = {
    sm: { fontSize: 14, fontWeight: '600' as const },
    md: { fontSize: 20, fontWeight: '700' as const },
    lg: { fontSize: 28, fontWeight: '700' as const },
  };

  return (
    <View style={[{ flexDirection: 'row', alignItems: 'baseline', gap: SPACING.sm }, style]}>
      {label && <Text style={[{ color: colors.textMuted }, typography.small]}>{label}</Text>}
      <Text style={[{ color: colors.primary }, sizes[size]]}>{formatted}</Text>
    </View>
  );
}
