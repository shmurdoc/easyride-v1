import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import { useTheme } from '../theme';
import { SPACING, RADIUS, COLORS } from '../constants';
import { Card } from './Card';
import { Badge } from './Badge';

interface DriverCardProps {
  name: string;
  rating: number;
  vehicleInfo?: string;
  licensePlate?: string;
  distance?: number;
  eta?: number;
  status?: 'available' | 'busy' | 'offline';
  onPress?: () => void;
  style?: ViewStyle;
}

export function DriverCard({
  name, rating, vehicleInfo, licensePlate,
  distance, eta, status = 'available', onPress, style,
}: DriverCardProps) {
  const { colors, typography } = useTheme();

  const statusColors = {
    available: colors.success,
    busy: colors.primary,
    offline: colors.textMuted,
  };

  return (
    <Card variant="interactive" style={style}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.md }}>
        <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surfaceLight, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={[{ color: colors.primary, fontWeight: '700' }, typography.h3]}>
            {name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm }}>
            <Text style={[{ color: colors.text }, typography.body, { fontWeight: '600' }]}>{name}</Text>
            <Text style={[{ color: colors.primary }, typography.small]}>
              {'★'} {rating.toFixed(1)}
            </Text>
          </View>
          {vehicleInfo && (
            <Text style={[{ color: colors.textMuted }, typography.xs]}>{vehicleInfo}</Text>
          )}
          {licensePlate && (
            <Text style={[{ color: colors.textMuted }, typography.xs]}>{licensePlate}</Text>
          )}
        </View>
        <View style={{ alignItems: 'flex-end', gap: 2 }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: statusColors[status] }} />
          {distance && <Text style={[{ color: colors.textMuted }, typography.xs]}>{distance.toFixed(1)}km</Text>}
          {eta && <Text style={[{ color: colors.textMuted }, typography.xs]}>{eta}min</Text>}
        </View>
      </View>
    </Card>
  );
}
