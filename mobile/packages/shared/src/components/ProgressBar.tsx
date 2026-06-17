import React from 'react';
import { View, ViewStyle } from 'react-native';
import { COLORS, RADIUS } from '../constants';

interface ProgressBarProps {
  progress: number;
  height?: number;
  color?: string;
  backgroundColor?: string;
  style?: ViewStyle;
}

export function ProgressBar({
  progress, height = 4,
  color = COLORS.primary, backgroundColor = COLORS.surfaceLight, style,
}: ProgressBarProps) {
  return (
    <View style={[{ height, backgroundColor, borderRadius: height / 2, overflow: 'hidden' }, style]}>
      <View style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` as any, height: '100%', backgroundColor: color, borderRadius: height / 2 }} />
    </View>
  );
}
