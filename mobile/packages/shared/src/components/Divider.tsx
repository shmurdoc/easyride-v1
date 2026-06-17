import React from 'react';
import { View, ViewStyle } from 'react-native';
import { COLORS, SPACING } from '../constants';

interface DividerProps {
  style?: ViewStyle;
}

export function Divider({ style }: DividerProps) {
  return (
    <View style={[{ height: 1, backgroundColor: COLORS.border, marginVertical: SPACING.md }, style]} />
  );
}
