import { PreferenceService } from '@/services/preference-service';
import {
  detectLanguage,
  LanguageDetectorMiddleware,
  TolgeePlugin,
} from '@tolgee/react';

export function detectLanguageFromDateLocale(availableLanguages: string[]) {
  return detectLanguage(
    Intl.DateTimeFormat().resolvedOptions().locale,
    availableLanguages,
  );
}

export const detectLanguageOrPreferred = (
  preferenceService: PreferenceService,
  availableLanguages: string[],
) => {
  const preference = preferenceService.getPreferredLanguage();
  if (preference) {
    return preference;
  }
  const lang = detectLanguageFromDateLocale(availableLanguages);
  return lang;
};

export const createLanguageDetector = (
  preferenceService: PreferenceService,
): LanguageDetectorMiddleware => ({
  getLanguage: (props) => {
    return detectLanguageOrPreferred(
      preferenceService,
      props.availableLanguages,
    );
  },
});

export const DetectLanguage =
  (preferenceService: PreferenceService): TolgeePlugin =>
  (tolgee, tools) => {
    tools.setLanguageDetector(createLanguageDetector(preferenceService));
    return tolgee;
  };
