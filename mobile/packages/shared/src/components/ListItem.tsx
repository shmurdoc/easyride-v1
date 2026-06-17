import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../theme';
import { SPACING, RADIUS, COLORS } from '../constants';

interface ListItemProps {
  left?: React.ReactNode;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  style?: ViewStyle;
}

export function ListItem({ left, title, subtitle, right, style }: ListItemProps) {
  const { colors, typography } = useTheme();

  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.md, gap: SPACING.md }, style]}>
      {left && <View>{left}</View>}
      <View style={{ flex: 1 }}>
        <Text style={[{ color: colors.text }, typography.body, { fontWeight: '500' }]}>{title}</Text>
        {subtitle && (
          <Text style={[{ color: colors.textMuted, marginTop: 2 }, typography.xs]}>{subtitle}</Text>
        )}
      </View>
      {right && <View>{right}</View>}
    </View>
  );
}
