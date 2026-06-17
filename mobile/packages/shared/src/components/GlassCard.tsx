import React, { useRef } from 'react';
import { Animated, View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SPACING, RADIUS, COLORS } from '../constants';

interface GlassCardProps {
  children: React.ReactNode;
  padding?: number;
  glow?: boolean;
  glowColor?: string;
  style?: ViewStyle;
}

export function GlassCard({
  children,
  padding = SPACING.base,
  glow = false,
  glowColor = COLORS.primary,
  style,
}: GlassCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.98, useNativeDriver: true, speed: 50, bounciness: 4 }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 50, bounciness: 4 }).start();
  };

  return (
    <Animated.View style={[
      { transform: [{ scale: scaleAnim }] },
      glow ? {
        shadowColor: glowColor,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 8,
      } : {},
    ]}>
      <View
        onStartShouldSetResponder={() => true}
        onResponderGrant={handlePressIn}
        onResponderRelease={handlePressOut}
        style={[{
          padding,
          borderRadius: RADIUS.xl,
          backgroundColor: COLORS.glass,
          borderWidth: 1,
          borderColor: COLORS.glassBorder,
          overflow: 'hidden',
        }, style]}
      >
        <LinearGradient
          colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={[StyleSheet.absoluteFill, { borderRadius: RADIUS.xl }]}
        />
        <View style={{ position: 'relative' }}>
          {children}
        </View>
      </View>
    </Animated.View>
  );
}
