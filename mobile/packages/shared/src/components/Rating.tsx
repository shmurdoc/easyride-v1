import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import { useTheme } from '../theme';
import { SPACING, COLORS } from '../constants';

interface RatingProps {
  score: number;
  maxScore?: number;
  showValue?: boolean;
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export function Rating({ score, maxScore = 5, showValue = true, size = 'sm', style }: RatingProps) {
  const { colors, typography } = useTheme();
  const stars = Math.round(score);
  const starSize = size === 'md' ? 16 : 12;

  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 2 }, style]}>
      {Array.from({ length: maxScore }, (_, i) => (
        <Text key={i} style={{ fontSize: starSize, color: i < stars ? colors.primary : colors.border }}>
          ★
        </Text>
      ))}
      {showValue && (
        <Text style={[{ color: colors.textMuted, marginLeft: 4 }, typography.xs]}>
          {score.toFixed(1)}
        </Text>
      )}
    </View>
  );
}
