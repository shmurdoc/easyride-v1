import { useCallback } from 'react';
import { t, getLocale } from './index';
import type { TranslationKey } from './index';

export function useTranslation() {
  const translate = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>) => t(key, params),
    [],
  );
  return { t: translate, locale: getLocale() };
}
