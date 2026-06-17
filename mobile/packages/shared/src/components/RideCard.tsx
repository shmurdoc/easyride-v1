import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import { useTheme } from '../theme';
import { SPACING, RADIUS, COLORS } from '../constants';
import { Card } from './Card';
import { Badge } from './Badge';

interface RideCardProps {
  pickupAddress: string;
  dropoffAddress: string;
  status: string;
  category?: string;
  distance?: number;
  fare?: number;
  driverName?: string;
  onPress?: () => void;
  style?: ViewStyle;
}

export function RideCard({
  pickupAddress, dropoffAddress, status, category,
  distance, fare, driverName, onPress, style,
}: RideCardProps) {
  const { colors, typography } = useTheme();

  return (
    <Card variant="interactive" style={style}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary, marginRight: SPACING.sm }} />
            <Text style={[{ color: colors.text, flex: 1 }, typography.body]} numberOfLines={1}>{pickupAddress}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success, marginRight: SPACING.sm }} />
            <Text style={[{ color: colors.text, flex: 1 }, typography.body]} numberOfLines={1}>{dropoffAddress}</Text>
          </View>
        </View>
        <Badge label={status.replace('_', ' ')} variant="info" />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: SPACING.md }}>
        {category && <Text style={[{ color: colors.textMuted }, typography.small]}>{category}</Text>}
        {distance && <Text style={[{ color: colors.textMuted }, typography.small]}>{distance.toFixed(1)} km</Text>}
        {fare && <Text style={[{ color: colors.primary, fontWeight: '700' }, typography.body]}>R {fare.toFixed(2)}</Text>}
      </View>
      {driverName && (
        <Text style={[{ color: colors.textMuted, marginTop: SPACING.sm }, typography.xs]}>
          Driver: {driverName}
        </Text>
      )}
    </Card>
  );
}
