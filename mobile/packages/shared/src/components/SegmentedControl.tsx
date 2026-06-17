import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Pressable, Animated, Dimensions, ViewStyle } from 'react-native';
import { useTheme } from '../theme';
import { SPACING, RADIUS, COLORS } from '../constants';

interface Tab {
  key: string;
  label: string;
}

interface SegmentedControlProps {
  tabs: Tab[];
  selected: string;
  onSelect: (key: string) => void;
  style?: ViewStyle;
}

export function SegmentedControl({ tabs, selected, onSelect, style }: SegmentedControlProps) {
  const { colors, typography } = useTheme();
  const [width, setWidth] = useState(0);
  const translateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (width > 0) {
      const idx = tabs.findIndex(t => t.key === selected);
      Animated.spring(translateX, {
        toValue: (width / tabs.length) * idx,
        useNativeDriver: true,
        damping: 15,
      }).start();
    }
  }, [selected, width, tabs.length]);

  return (
    <View
      style={[{ flexDirection: 'row', backgroundColor: colors.surface, borderRadius: RADIUS.md, padding: 2, position: 'relative' }, style]}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
    >
      <Animated.View style={[{
        position: 'absolute', top: 2, bottom: 2, width: `${100 / tabs.length}%` as any,
        backgroundColor: colors.surfaceLight, borderRadius: RADIUS.sm,
        transform: [{ translateX }],
      }]} />
      {tabs.map(tab => (
        <Pressable
          key={tab.key}
          onPress={() => onSelect(tab.key)}
          style={{ flex: 1, paddingVertical: 10, alignItems: 'center' }}
        >
          <Text style={[typography.small, { fontWeight: selected === tab.key ? '600' : '400', color: selected === tab.key ? colors.primary : colors.textMuted }]}>
            {tab.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
