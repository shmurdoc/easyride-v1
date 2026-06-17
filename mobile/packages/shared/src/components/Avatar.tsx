import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import { useTheme } from '../theme';

interface AvatarProps {
  name: string;
  size?: number;
  uri?: string;
  style?: ViewStyle;
}

export function Avatar({ name, size = 44, uri, style }: AvatarProps) {
  const { colors, typography } = useTheme();
  const initial = name.charAt(0).toUpperCase();

  return (
    <View style={[{
      width: size, height: size, borderRadius: size / 2,
      backgroundColor: colors.surfaceLight, justifyContent: 'center', alignItems: 'center',
    }, style]}>
      <Text style={[{ color: colors.primary, fontWeight: '700', fontSize: size * 0.4 }]}>
        {initial}
      </Text>
    </View>
  );
}
