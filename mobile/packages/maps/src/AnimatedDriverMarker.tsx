import React, { useEffect, useRef } from 'react';
import { Marker } from 'react-native-maps';
import { Animated, Image } from 'react-native';

interface AnimatedDriverMarkerProps {
  latitude: number;
  longitude: number;
  heading?: number;
  vehicleType?: 'sedan' | 'suv' | 'bakkie';
  isPulsing?: boolean;
}

export function AnimatedDriverMarker({
  latitude,
  longitude,
  heading = 0,
  vehicleType = 'sedan',
  isPulsing = false,
}: AnimatedDriverMarkerProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isPulsing) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.2, duration: 500, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        ]),
        { iterations: 3 }
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [isPulsing, pulseAnim]);

  const iconMap = {
    sedan: require('../assets/car-sedan.png'),
    suv: require('../assets/car-suv.png'),
    bakkie: require('../assets/car-bakkie.png'),
  };

  return (
    <Marker
      coordinate={{ latitude, longitude }}
      anchor={{ x: 0.5, y: 0.5 }}
      rotation={heading}
    >
      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
        <Image
          source={iconMap[vehicleType]}
          style={{ width: 32, height: 32 }}
          resizeMode="contain"
        />
      </Animated.View>
    </Marker>
  );
}
