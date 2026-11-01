import { supportedLanguages } from '@/services/tolgee';
import { Platform } from 'react-native';
import { getApplicationLanguage, setApplicationLanguage } from '~/modules/native-lib/src/LiftLogLocaleModule';

export function hasSystemLanguagePicker() {
  return Platform.OS === 'android' && Platform.Version >= 33;
}

export function getSystemLanguage(): string | undefined {
  const tag = getApplicationLanguage()?.toLowerCase();
  return supportedLanguages.find((language) => language.code === tag)?.code;
}

export function setSystemLanguage(code: string | undefined) {
  if (getSystemLanguage() !== code) {
    setApplicationLanguage(code);
  }
}
