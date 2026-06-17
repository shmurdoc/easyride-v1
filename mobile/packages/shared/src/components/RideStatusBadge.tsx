import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import { useTheme } from '../theme';
import { SPACING, RADIUS, COLORS, RIDE_STATUS_COLORS, RIDE_STATUS_LABELS } from '../constants';

interface RideStatusBadgeProps {
  status: string;
  style?: ViewStyle;
}

export function RideStatusBadge({ status, style }: RideStatusBadgeProps) {
  const { colors, typography } = useTheme();
  const statusColor = RIDE_STATUS_COLORS[status] || colors.textMuted;
  const label = RIDE_STATUS_LABELS[status] || status;

  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm }, style]}>
      <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: statusColor }} />
      <Text style={[{ color: statusColor, fontWeight: '600' }, typography.body]}>{label}</Text>
    </View>
  );
}
