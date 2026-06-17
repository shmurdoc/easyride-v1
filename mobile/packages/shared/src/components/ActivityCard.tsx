import React from 'react';
import { TouchableOpacity, StyleSheet, View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, GRADIENTS } from '../constants';
import { GradientText } from './GradientText';
import type { Ride } from '../types';

interface ActivityCardProps {
  ride: Ride;
  onPress?: () => void;
}

export function ActivityCard({ ride, onPress }: ActivityCardProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={styles.container}>
      <View style={styles.inner}>
        <LinearGradient
          colors={['#1a1a2e', '#16213e']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.mapOverlay}>
          <Ionicons name="map-outline" size={48} color={COLORS.textDim} />
        </View>
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.bottomGradient}
        />
        <View style={styles.content}>
          <Text style={styles.category}>{ride.category || 'Comfort'}</Text>
          <Text style={styles.date}>{ride.created_at || ''}</Text>
          <View style={styles.row}>
            <GradientText
              colors={GRADIENTS.primary}
              style={styles.fare}
            >
              R {ride.total_fare?.toFixed(2) || '0.00'}
            </GradientText>
            <Text style={[styles.status, ride.status === 'cancelled' && styles.cancelled]}>
              {ride.status === 'cancelled' ? 'Canceled' : ride.status}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 160,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.base,
  },
  inner: {
    flex: 1,
    overflow: 'hidden',
  },
  mapOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  content: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.base,
  },
  category: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
  },
  date: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  fare: {
    fontSize: 16,
    fontWeight: '700',
  },
  status: {
    color: COLORS.success,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  cancelled: {
    color: COLORS.error,
  },
});
