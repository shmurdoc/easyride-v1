import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import { useTheme } from '../theme';
import { SPACING } from '../constants';

interface EmptyStateProps {
  title: string;
  message?: string;
  action?: React.ReactNode;
  style?: ViewStyle;
}

export function EmptyState({ title, message, action, style }: EmptyStateProps) {
  const { colors, typography } = useTheme();

  return (
    <View style={[{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xl }, style]}>
      <Text style={[{ color: colors.text, textAlign: 'center' }, typography.h3]}>{title}</Text>
      {message && (
        <Text style={[{ color: colors.textMuted, textAlign: 'center', marginTop: SPACING.sm }, typography.body]}>
          {message}
        </Text>
      )}
      {action && <View style={{ marginTop: SPACING.lg }}>{action}</View>}
    </View>
  );
}
