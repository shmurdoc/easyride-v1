import React from 'react';
import { View, Pressable, Text, ViewStyle } from 'react-native';
import { useTheme } from '../theme';
import { SPACING, RADIUS, COLORS, RIDE_CATEGORIES } from '../constants';
import { Card } from './Card';

interface VehicleSelectorProps {
  selected: string;
  onSelect: (id: string) => void;
  style?: ViewStyle;
}

export function VehicleSelector({ selected, onSelect, style }: VehicleSelectorProps) {
  const { colors, typography } = useTheme();

  return (
    <View style={[{ gap: SPACING.sm }, style]}>
      {RIDE_CATEGORIES.map(cat => {
        const isSelected = cat.id === selected;
        return (
          <Pressable key={cat.id} onPress={() => onSelect(cat.id)}>
            <View style={{
              flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
              padding: SPACING.base, backgroundColor: isSelected ? colors.surfaceLight : colors.surface,
              borderRadius: RADIUS.md, borderWidth: 1, borderColor: isSelected ? colors.primary : colors.border,
            }}>
              <View style={{ flex: 1 }}>
                <Text style={[typography.body, { fontWeight: '600', color: colors.text }]}>{cat.name}</Text>
                <Text style={[typography.small, { color: colors.textMuted }]}>R{cat.perKm}/km · R{cat.perMin}/min</Text>
              </View>
              <Text style={[typography.body, { fontWeight: '700', color: colors.primary }]}>
                R{cat.baseFare}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
