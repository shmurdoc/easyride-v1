import React, { useRef, useEffect } from 'react';
import { Animated, View, ViewStyle, DimensionValue } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, RADIUS, SPACING } from '../constants';

interface SkeletonProps {
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({ width = '100%', height = 16, borderRadius = RADIUS.sm, style }: SkeletonProps) {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmer = Animated.loop(
      Animated.timing(shimmerAnim, { toValue: 1, duration: 1500, useNativeDriver: true })
    );
    shimmer.start();
    return () => shimmer.stop();
  }, []);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
  });

  return (
    <View style={[{
      width,
      height,
      borderRadius,
      backgroundColor: COLORS.surface,
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
          colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.06)', 'rgba(255,255,255,0)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ flex: 1 }}
        />
      </Animated.View>
    </View>
  );
}

export function SkeletonCard({ style }: { style?: ViewStyle }) {
  return (
    <View style={[{
      backgroundColor: COLORS.surface,
      borderRadius: RADIUS.lg,
      padding: SPACING.base,
      gap: SPACING.md,
      borderWidth: 1,
      borderColor: COLORS.border,
    }, style]}>
      <Skeleton width="50%" height={20} borderRadius={RADIUS.sm} />
      <Skeleton width="100%" height={14} borderRadius={RADIUS.xs} />
      <Skeleton width="75%" height={14} borderRadius={RADIUS.xs} />
      <View style={{ flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.sm }}>
        <Skeleton width={80} height={32} borderRadius={RADIUS.full} />
        <Skeleton width={60} height={32} borderRadius={RADIUS.full} />
      </View>
    </View>
  );
}

export function SkeletonCircle({ size = 48, style }: { size?: number; style?: ViewStyle }) {
  return <Skeleton width={size} height={size} borderRadius={size / 2} style={style} />;
}
