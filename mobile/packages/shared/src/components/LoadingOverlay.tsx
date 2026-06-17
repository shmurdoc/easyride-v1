import React, { useRef, useEffect } from 'react';
import { Animated, View, Text, ViewStyle } from 'react-native';
import { useTheme } from '../theme';
import { COLORS, SHADOWS } from '../constants';

interface LoadingOverlayProps {
  message?: string;
  style?: ViewStyle;
}

export function LoadingOverlay({ message, style }: LoadingOverlayProps) {
  const { colors, typography } = useTheme();
  const pulseAnim = useRef(new Animated.Value(0.4)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.4, duration: 800, useNativeDriver: true }),
      ])
    );
    const rotate = Animated.loop(
      Animated.timing(rotateAnim, { toValue: 1, duration: 2000, useNativeDriver: true })
    );
    pulse.start();
    rotate.start();
    return () => { pulse.stop(); rotate.stop(); };
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: COLORS.bg,
    }, style]}>
      <Animated.View style={{
        width: 64,
        height: 64,
        borderRadius: 32,
        borderWidth: 3,
        borderColor: 'transparent',
        borderTopColor: COLORS.primary,
        borderRightColor: COLORS.primaryLight,
        transform: [{ rotate: spin }],
        opacity: pulseAnim,
      }} />
      <Animated.View style={[{
        position: 'absolute',
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: COLORS.primaryGlow,
        opacity: pulseAnim,
      }, SHADOWS.glow]} />
      {message && (
        <Animated.Text style={[
          { color: colors.textMuted, marginTop: 24, letterSpacing: 1 },
          typography.body,
          { opacity: pulseAnim },
        ]}>
          {message}
        </Animated.Text>
      )}
    </View>
  );
}
