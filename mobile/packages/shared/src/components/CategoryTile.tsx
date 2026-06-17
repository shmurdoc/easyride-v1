import React, { useRef } from 'react';
import { Animated, TouchableOpacity, StyleSheet, ViewStyle, View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../constants';

interface CategoryTileProps {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  badge?: string;
  selected?: boolean;
  onPress: () => void;
  style?: ViewStyle;
}

export function CategoryTile({
  label,
  icon = 'car-outline',
  badge,
  selected = false,
  onPress,
  style,
}: CategoryTileProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.95, useNativeDriver: true, speed: 50, bounciness: 4 }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 50, bounciness: 4 }).start();
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        style={styles.container}
      >
        <View style={[styles.inner, selected && styles.innerSelected]}>
          <LinearGradient
            colors={[COLORS.tileBg, COLORS.warmBg]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.iconArea}>
            <Ionicons name={icon} size={36} color={selected ? COLORS.primary : COLORS.textMuted} />
          </View>
          {badge ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          ) : null}
          <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    aspectRatio: 1.1,
  },
  inner: {
    flex: 1,
    borderRadius: RADIUS.tile,
    borderWidth: 1,
    borderColor: COLORS.tileBorder,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    padding: SPACING.md,
  },
  innerSelected: {
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  iconArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: SPACING.sm,
  },
  badge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  badgeText: {
    color: COLORS.bg,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  label: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  labelSelected: {
    color: COLORS.primary,
  },
});
