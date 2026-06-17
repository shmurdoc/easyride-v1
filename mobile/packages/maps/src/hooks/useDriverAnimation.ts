import { useRef, useEffect } from 'react';
import { Animated } from 'react-native';

export function useDriverAnimation(latitude: number, longitude: number, heading?: number) {
  const animatedLat = useRef(new Animated.Value(latitude)).current;
  const animatedLng = useRef(new Animated.Value(longitude)).current;
  const animatedHeading = useRef(new Animated.Value(heading || 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(animatedLat, { toValue: latitude, duration: 2000, useNativeDriver: true }),
      Animated.timing(animatedLng, { toValue: longitude, duration: 2000, useNativeDriver: true }),
    ]).start();
  }, [latitude, longitude, animatedLat, animatedLng]);

  useEffect(() => {
    if (heading !== undefined) {
      Animated.timing(animatedHeading, { toValue: heading, duration: 500, useNativeDriver: true }).start();
    }
  }, [heading, animatedHeading]);

  return { animatedLat, animatedLng, animatedHeading };
}
