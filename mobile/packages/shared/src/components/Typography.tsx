import React from 'react';
import { Text, TextStyle, View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme';
import * as constants from '../constants';

type TextVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'bodySmall' | 'small' | 'xs' | 'caption' | 'label' | 'price' | 'eta';

interface TypographyProps {
  variant?: TextVariant;
  color?: string;
  gradient?: readonly [string, string, ...string[]];
  align?: 'left' | 'center' | 'right';
  style?: TextStyle;
  numberOfLines?: number;
  children: React.ReactNode;
}

export function Typography({ variant = 'body', color, gradient, align, style, numberOfLines, children }: TypographyProps) {
  const { colors, typography } = useTheme();
  const variantStyle = typography[variant] || typography.body;

  if (gradient) {
    return (
      <View style={{ overflow: 'hidden' }}>
        <Text style={[variantStyle, { color: 'transparent', textAlign: align }, style]} numberOfLines={numberOfLines}>
          {children}
        </Text>
        <LinearGradient
          colors={gradient as unknown as string[]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[StyleSheet.absoluteFill]}
          pointerEvents="none"
        >
          <Text style={[variantStyle, { color: 'transparent', textAlign: align }, style]} numberOfLines={numberOfLines}>
            {children}
          </Text>
        </LinearGradient>
      </View>
    );
  }

  return (
    <Text style={[{ color: color || colors.text, textAlign: align }, variantStyle, style]} numberOfLines={numberOfLines}>
      {children}
    </Text>
  );
}
