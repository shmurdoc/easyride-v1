import React, { useEffect, useRef } from 'react';
import { Animated, Text, ViewStyle, Platform } from 'react-native';
import { useTheme } from '../theme';
import { SPACING, RADIUS, COLORS, SHADOWS } from '../constants';

type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  visible: boolean;
  message: string;
  type?: ToastType;
  duration?: number;
  onHide: () => void;
  style?: ViewStyle;
}

export function Toast({ visible, message, type = 'info', duration = 3000, onHide, style }: ToastProps) {
  const { colors, typography } = useTheme();
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true, speed: 40, bounciness: 10 }),
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 40, bounciness: 8 }),
      ]).start(() => {
        setTimeout(() => {
          Animated.parallel([
            Animated.timing(translateY, { toValue: -100, duration: 200, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
          ]).start(() => onHide());
        }, duration);
      });
    }
  }, [visible]);

  if (!visible) return null;

  const configs: Record<ToastType, { bg: string; icon: string; glow: ViewStyle }> = {
    success: { bg: COLORS.success, icon: '✓', glow: SHADOWS.glowSuccess },
    error: { bg: COLORS.error, icon: '✕', glow: SHADOWS.glowError },
    info: { bg: COLORS.surfaceElevated, icon: 'ℹ', glow: SHADOWS.moderate },
  };

  const config = configs[type];

  return (
    <Animated.View style={[{
      position: 'absolute',
      top: Platform.OS === 'ios' ? 60 : 40,
      left: SPACING.base,
      right: SPACING.base,
      backgroundColor: config.bg,
      borderRadius: RADIUS.lg,
      padding: SPACING.base,
      opacity,
      transform: [{ translateY }, { scale: scaleAnim }],
      zIndex: 1000,
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: type === 'info' ? 1 : 0,
      borderColor: COLORS.borderLight,
    }, config.glow, style]}>
      <Text style={{
        fontSize: 18,
        fontWeight: '700',
        color: type === 'info' ? COLORS.primary : COLORS.white,
        marginRight: SPACING.sm,
      }}>
        {config.icon}
      </Text>
      <Text style={[
        { color: type === 'info' ? colors.text : COLORS.white, flex: 1 },
        typography.bodySmall,
      ]}>
        {message}
      </Text>
    </Animated.View>
  );
}
