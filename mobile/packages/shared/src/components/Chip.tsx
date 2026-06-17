import React from 'react';
import { View, Pressable, Text, ViewStyle } from 'react-native';
import { useTheme } from '../theme';
import { SPACING, RADIUS, COLORS } from '../constants';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

export function Chip({ label, selected, onPress, style }: ChipProps) {
  const { colors, typography } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={[{
        paddingVertical: 6, paddingHorizontal: SPACING.md,
        backgroundColor: selected ? colors.primary : colors.surface,
        borderRadius: RADIUS.md,
        borderWidth: selected ? 0 : 1,
        borderColor: colors.border,
      }, style]}
    >
      <Text style={[typography.small, { fontWeight: '500', color: selected ? colors.bg : colors.text }]}>
        {label}
      </Text>
    </Pressable>
  );
}
