import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import { useTheme } from '../theme';
import { SPACING } from '../constants';
import { Button } from './Button';

interface HeaderProps {
  title: string;
  leftAction?: { icon: string; onPress: () => void };
  rightAction?: { icon: string; onPress: () => void };
  style?: ViewStyle;
}

export function Header({ title, leftAction, rightAction, style }: HeaderProps) {
  const { colors, typography } = useTheme();

  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.base, paddingVertical: SPACING.md, backgroundColor: colors.bg }, style]}>
      <View style={{ width: 44, alignItems: 'flex-start' }}>
        {leftAction && (
          <Button title={leftAction.icon} onPress={leftAction.onPress} variant="ghost" size="sm" />
        )}
      </View>
      <View style={{ flex: 1, alignItems: 'center' }}>
        <Text style={[{ color: colors.text }, typography.h3]}>{title}</Text>
      </View>
      <View style={{ width: 44, alignItems: 'flex-end' }}>
        {rightAction && (
          <Button title={rightAction.icon} onPress={rightAction.onPress} variant="ghost" size="sm" />
        )}
      </View>
    </View>
  );
}
