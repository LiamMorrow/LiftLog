import { PreferenceService } from '@/services/preference-service';
import { detectLanguage, LanguageDetectorMiddleware, TolgeePlugin } from '@tolgee/react';

// Tolgee's types claim `detectLanguage` returns a string, but it returns undefined for a locale with
// no exact or two-letter match.
export function detectLanguageFromDateLocale(availableLanguages: string[]): string | undefined {
  return detectLanguage(Intl.DateTimeFormat().resolvedOptions().locale, availableLanguages) as string | undefined;
}

export const detectLanguageOrPreferred = (preferenceService: PreferenceService, availableLanguages: string[]) => {
  const preference = preferenceService.getPreferredLanguage();
  if (preference) {
    return preference;
  }
  const lang = detectLanguageFromDateLocale(availableLanguages);
  return lang;
};

const createLanguageDetector = (preferenceService: PreferenceService): LanguageDetectorMiddleware => ({
  getLanguage: (props) => {
    return detectLanguageOrPreferred(preferenceService, props.availableLanguages);
  },
});

export const DetectLanguage =
  (preferenceService: PreferenceService): TolgeePlugin =>
  (tolgee, tools) => {
    tools.setLanguageDetector(createLanguageDetector(preferenceService));
    return tolgee;
  };
