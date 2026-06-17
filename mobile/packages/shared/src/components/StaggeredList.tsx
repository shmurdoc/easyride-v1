import React, { useRef, useEffect } from 'react';
import { Animated, View, ViewStyle } from 'react-native';

interface StaggeredListProps {
  children: React.ReactNode[];
  staggerDelay?: number;
  style?: ViewStyle;
}

export function StaggeredList({ children, staggerDelay = 80, style }: StaggeredListProps) {
  const animValues = useRef(children.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const animations = animValues.map((anim, i) =>
      Animated.spring(anim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 12,
        bounciness: 6,
        delay: i * staggerDelay,
      })
    );
    Animated.stagger(staggerDelay, animations).start();
  }, []);

  return (
    <View style={style}>
      {children.map((child, i) => (
        <Animated.View
          key={i}
          style={{
            opacity: animValues[i],
            transform: [
              {
                translateY: animValues[i].interpolate({
                  inputRange: [0, 1],
                  outputRange: [24, 0],
                }),
              },
            ],
          }}
        >
          {child}
        </Animated.View>
      ))}
    </View>
  );
}
