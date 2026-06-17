import React, { useRef, useEffect } from 'react';
import { Animated, View, StyleSheet } from 'react-native';
import { COLORS } from '../constants';

interface AnimatedCheckmarkProps {
  size?: number;
  color?: string;
  duration?: number;
}

export function AnimatedCheckmark({
  size = 80,
  color = COLORS.success,
  duration = 600,
}: AnimatedCheckmarkProps) {
  const circleAnim = useRef(new Animated.Value(0)).current;
  const checkAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(circleAnim, {
        toValue: 1,
        duration: duration * 0.5,
        useNativeDriver: true,
      }),
      Animated.spring(checkAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 8,
        bounciness: 6,
      }),
    ]).start();
  }, []);

  const strokeDasharray = size * 2.2;
  const circleRadius = size * 0.4;
  const circleCircumference = 2 * Math.PI * circleRadius;

  const checkSize = size * 0.5;
  const checkOffset = size * 0.25;

  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Animated.View
        style={[
          styles.circle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor: color,
            borderWidth: 3,
            opacity: circleAnim,
            transform: [
              {
                scale: circleAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.3, 1],
                }),
              },
            ],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.checkContainer,
          {
            opacity: checkAnim,
            transform: [{ scale: checkAnim }],
          },
        ]}
      >
        <View
          style={[
            styles.checkLine1,
            {
              width: checkSize * 0.5,
              height: 3,
              backgroundColor: color,
              borderRadius: 1.5,
              transform: [{ rotate: '-45deg' }, { translateX: 2 }, { translateY: 1 }],
            },
          ]}
        />
        <View
          style={[
            styles.checkLine2,
            {
              width: checkSize * 0.8,
              height: 3,
              backgroundColor: color,
              borderRadius: 1.5,
              transform: [{ rotate: '45deg' }, { translateX: -4 }, { translateY: -1 }],
            },
          ]}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkLine1: {
    position: 'absolute',
  },
  checkLine2: {
    position: 'absolute',
  },
});
