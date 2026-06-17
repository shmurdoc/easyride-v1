import React, { useEffect, useRef } from 'react';
import MapView, { Polyline as MapPolyline, AnimatedRegion } from 'react-native-maps';
import { Animated } from 'react-native';

interface RoutePolylineProps {
  coordinates: { latitude: number; longitude: number }[];
  strokeColor?: string;
  strokeWidth?: number;
}

export function RoutePolyline({ coordinates, strokeColor = '#1E3A5F', strokeWidth = 4 }: RoutePolylineProps) {
  const animatedOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedOpacity, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start();
  }, [coordinates, animatedOpacity]);

  return (
    <>
      <MapPolyline
        coordinates={coordinates}
        strokeColor="rgba(255,255,255,0.3)"
        strokeWidth={strokeWidth + 2}
      />
      <MapPolyline
        coordinates={coordinates}
        strokeColor={strokeColor}
        strokeWidth={strokeWidth}
      />
    </>
  );
}
