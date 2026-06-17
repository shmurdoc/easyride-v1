import { getLocales } from 'expo-localization';
import en from './en';
import type { TranslationKeys } from './en';

export type TranslationKey = string;

type TranslationValue = string | { [key: string]: TranslationValue };

let translations: TranslationKeys = en;
let locale: string = getLocales()?.[0]?.languageTag ?? 'en-US';

export function setLocale(localeCode: string) {
  locale = localeCode;
}

export function getLocale(): string {
  return locale;
}

function getNestedValue(obj: TranslationValue, path: string[]): string | undefined {
  let current: TranslationValue = obj;
  for (const key of path) {
    if (current == null || typeof current !== 'object') return undefined;
    current = (current as Record<string, TranslationValue>)[key];
  }
  return typeof current === 'string' ? current : undefined;
}

export function t(key: TranslationKey, params?: Record<string, string | number>): string {
  const path = key.split('.');
  let value = getNestedValue(translations as unknown as TranslationValue, path);
  if (!value) {
    return key;
  }
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      value = value.replace(`{${k}}`, String(v));
    }
  }
  return value;
}

// Re-export hook so consumers can import it from the package root via
// `import { useTranslation } from '@easyryde/shared'`.
export { useTranslation } from './useTranslation';
