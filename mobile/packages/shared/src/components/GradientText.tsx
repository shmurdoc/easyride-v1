import React from 'react';
import { Text, TextStyle, View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GRADIENTS } from '../constants';

interface GradientTextProps {
  colors?: readonly [string, string, ...string[]];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  style?: TextStyle;
  numberOfLines?: number;
  ellipsizeMode?: 'head' | 'middle' | 'tail' | 'clip';
  children: React.ReactNode;
}

export function GradientText({
  colors = GRADIENTS.primary,
  start = { x: 0, y: 0 },
  end = { x: 1, y: 0 },
  style,
  numberOfLines,
  ellipsizeMode,
  children,
}: GradientTextProps) {
  return (
    <View style={{ overflow: 'hidden' }}>
      <Text style={[style, { color: 'transparent' }]} numberOfLines={numberOfLines} ellipsizeMode={ellipsizeMode}>{children}</Text>
      <LinearGradient
        colors={colors as unknown as string[]}
        start={start}
        end={end}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      >
        <Text style={[style, { color: 'transparent' }]} numberOfLines={numberOfLines} ellipsizeMode={ellipsizeMode}>{children}</Text>
      </LinearGradient>
    </View>
  );
}
