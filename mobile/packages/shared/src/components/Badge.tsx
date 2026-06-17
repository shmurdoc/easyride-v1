import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import { useTheme } from '../theme';
import { SPACING, RADIUS, COLORS } from '../constants';

type BadgeVariant = 'success' | 'error' | 'warning' | 'info' | 'default';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
}

export function Badge({ label, variant = 'default', style }: BadgeProps) {
  const { colors, typography } = useTheme();

  const variantColors: Record<BadgeVariant, { bg: string; text: string }> = {
    success: { bg: colors.success, text: colors.white },
    error: { bg: colors.error, text: colors.white },
    warning: { bg: '#F59E0B', text: colors.black },
    info: { bg: colors.primary, text: colors.bg },
    default: { bg: colors.surfaceLight, text: colors.textMuted },
  };

  const { bg, text } = variantColors[variant];

  return (
    <View style={[{ backgroundColor: bg, borderRadius: RADIUS.sm, paddingHorizontal: SPACING.sm, paddingVertical: 2, alignSelf: 'flex-start' }, style]}>
      <Text style={[{ color: text, fontSize: 11, fontWeight: '600' }]}>{label}</Text>
    </View>
  );
}
