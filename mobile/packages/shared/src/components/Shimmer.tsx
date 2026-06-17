import React, { useRef, useEffect } from 'react';
import { Animated, View, ViewStyle, DimensionValue } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, RADIUS } from '../constants';

interface ShimmerProps {
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
  variant?: 'default' | 'gold';
  style?: ViewStyle;
}

export function Shimmer({
  width = '100%',
  height = 16,
  borderRadius = RADIUS.sm,
  variant = 'default',
  style,
}: ShimmerProps) {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmer = Animated.loop(
      Animated.timing(shimmerAnim, { toValue: 1, duration: 1200, useNativeDriver: true })
    );
    shimmer.start();
    return () => shimmer.stop();
  }, []);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-300, 300],
  });

  const colors = variant === 'gold'
    ? ['rgba(212,175,55,0)', 'rgba(212,175,55,0.12)', 'rgba(212,175,55,0)']
    : ['rgba(255,255,255,0)', 'rgba(255,255,255,0.06)', 'rgba(255,255,255,0)'];

  return (
    <View style={[{
      width,
      height,
      borderRadius,
      backgroundColor: variant === 'gold' ? 'rgba(212,175,55,0.05)' : COLORS.surface,
      overflow: 'hidden',
    }, style]}>
      <Animated.View style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        transform: [{ translateX }],
      }}>
        <LinearGradient
          colors={colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ flex: 1 }}
        />
      </Animated.View>
    </View>
  );
}
