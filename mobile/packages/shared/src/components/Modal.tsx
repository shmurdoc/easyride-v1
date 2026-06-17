import React, { useEffect, useRef } from 'react';
import { Animated, Modal as RNModal, Pressable, View, Text, ViewStyle, Dimensions } from 'react-native';
import { useTheme } from '../theme';
import { SPACING, RADIUS, COLORS } from '../constants';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  style?: ViewStyle;
}

export function Modal({ visible, onClose, title, children, style }: ModalProps) {
  const { colors, typography } = useTheme();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(backdropOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true, speed: 40, bounciness: 8 }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(backdropOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: SCREEN_HEIGHT, duration: 250, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  return (
    <RNModal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Pressable style={{ flex: 1 }} onPress={onClose}>
        <Animated.View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.85)',
          opacity: backdropOpacity,
        }} />
      </Pressable>
      <Animated.View style={[{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        maxHeight: '85%',
        transform: [{ translateY }],
      }]}>
        <View style={{
          backgroundColor: COLORS.surface,
          borderTopLeftRadius: RADIUS.xl,
          borderTopRightRadius: RADIUS.xl,
          borderWidth: 1,
          borderColor: COLORS.borderLight,
          borderBottomWidth: 0,
          overflow: 'hidden',
        }}>
          <View style={{
            width: 40,
            height: 4,
            borderRadius: 2,
            backgroundColor: COLORS.textDim,
            alignSelf: 'center',
            marginTop: SPACING.sm,
            marginBottom: SPACING.md,
          }} />
          <View style={{ padding: SPACING.lg, paddingBottom: SPACING['2xl'] }}>
            {title && (
              <Text style={[
                { color: colors.text, marginBottom: SPACING.base },
                typography.h3,
              ]}>
                {title}
              </Text>
            )}
            {children}
          </View>
        </View>
      </Animated.View>
    </RNModal>
  );
}
