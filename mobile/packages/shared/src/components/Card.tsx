import React, { useRef } from 'react';
import { Animated, View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme';
import { SPACING, RADIUS, SHADOWS, COLORS, GRADIENTS } from '../constants';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'raised' | 'interactive' | 'glass' | 'elevated';
  padding?: number;
  style?: ViewStyle;
}

export function Card({ children, variant = 'default', padding = SPACING.base, style }: CardProps) {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (variant === 'interactive' || variant === 'glass') {
      Animated.spring(scaleAnim, { toValue: 0.98, useNativeDriver: true, speed: 50, bounciness: 4 }).start();
    }
  };

  const handlePressOut = () => {
    if (variant === 'interactive' || variant === 'glass') {
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 50, bounciness: 4 }).start();
    }
  };

  if (variant === 'glass') {
    return (
      <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
        <View
          onStartShouldSetResponder={() => true}
          onResponderGrant={handlePressIn}
          onResponderRelease={handlePressOut}
          style={[{
            padding,
            borderRadius: RADIUS.lg,
            backgroundColor: COLORS.glass,
            borderWidth: 1,
            borderColor: COLORS.glassBorder,
            overflow: 'hidden',
          }, SHADOWS.moderate, style]}
        >
          {children}
        </View>
      </Animated.View>
    );
  }

  if (variant === 'elevated') {
    return (
      <View style={[{
        padding,
        borderRadius: RADIUS.lg,
        overflow: 'hidden',
      }, SHADOWS.elevated, style]}>
        <LinearGradient
          colors={GRADIENTS.surface as unknown as string[]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFill, { borderRadius: RADIUS.lg }]}
        />
        <View style={{ borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.lg, position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
        <View style={{ position: 'relative' }}>
          {children}
        </View>
      </View>
    );
  }

  const base: ViewStyle = {
    backgroundColor: colors.surface,
    borderRadius: RADIUS.lg,
    padding,
    borderWidth: 1,
    borderColor: COLORS.border,
  };

  const variants: Record<string, ViewStyle> = {
    default: {},
    raised: { ...SHADOWS.moderate },
    interactive: {},
  };

  return (
    <View style={[base, variants[variant], style]}>
      {children}
    </View>
  );
}
