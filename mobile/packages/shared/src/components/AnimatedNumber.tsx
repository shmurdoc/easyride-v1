import React, { useRef, useEffect } from 'react';
import { Animated, Platform, TextStyle, Vibration } from 'react-native';
import { useTheme } from '../theme';
import { GRADIENTS } from '../constants';
import { GradientText } from './GradientText';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  useGradient?: boolean;
  gradientColors?: readonly [string, string, ...string[]];
  style?: TextStyle;
  haptic?: boolean;
}

export function AnimatedNumber({
  value,
  duration = 800,
  prefix = '',
  suffix = '',
  decimals = 0,
  useGradient = false,
  gradientColors = GRADIENTS.primary,
  style,
  haptic = false,
}: AnimatedNumberProps) {
  const { typography, colors } = useTheme();
  const animatedValue = useRef(new Animated.Value(0)).current;
  const displayValue = useRef('0');
  const prevValue = useRef(0);
  const finishIdRef = useRef<string | null>(null);

  useEffect(() => {
    const listenerId = animatedValue.addListener(({ value: val }) => {
      displayValue.current = val.toFixed(decimals);
    });

    if (haptic && value !== prevValue.current) {
      finishIdRef.current = animatedValue.addListener(({ value: val }) => {
        if (Math.abs(val - value) < 0.01) {
          Vibration.vibrate(10);
          if (finishIdRef.current) {
            animatedValue.removeListener(finishIdRef.current);
            finishIdRef.current = null;
          }
        }
      });
    }

    Animated.timing(animatedValue, {
      toValue: value,
      duration,
      useNativeDriver: false,
    }).start();

    prevValue.current = value;
    return () => {
      animatedValue.removeListener(listenerId);
      if (finishIdRef.current) {
        animatedValue.removeListener(finishIdRef.current);
        finishIdRef.current = null;
      }
    };
  }, [value, duration, decimals]);

  const text = `${prefix}${displayValue.current}${suffix}`;

  if (useGradient) {
    return (
      <GradientText
        colors={gradientColors}
        style={[typography.price, style] as unknown as TextStyle}
      >
        {text}
      </GradientText>
    );
  }

  return (
    <Animated.Text style={[typography.price, { color: colors.text }, style]}>
      {text}
    </Animated.Text>
  );
}
