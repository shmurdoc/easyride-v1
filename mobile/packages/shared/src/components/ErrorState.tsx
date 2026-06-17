import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import { useTheme } from '../theme';
import { SPACING } from '../constants';
import { useTranslation } from '../i18n/useTranslation';
import { Button } from './Button';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  style?: ViewStyle;
}

export function ErrorState({ message, onRetry, style }: ErrorStateProps) {
  const { colors, typography } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={[{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xl }, style]}>
      <Text style={[{ color: colors.error, textAlign: 'center' }, typography.h3]}>{t('errors.somethingWentWrong')}</Text>
      <Text style={[{ color: colors.textMuted, textAlign: 'center', marginTop: SPACING.sm }, typography.body]}>
        {message}
      </Text>
      {onRetry && (
        <View style={{ marginTop: SPACING.lg }}>
          <Button title={t('common.tryAgain')} onPress={onRetry} variant="secondary" />
        </View>
      )}
    </View>
  );
}
