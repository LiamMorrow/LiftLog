import { PreferenceService } from '@/services/preference-service';
import { detectLanguage, LanguageDetectorMiddleware, TolgeePlugin } from '@tolgee/react';
import { getLocales } from 'expo-localization';

// Tolgee's types claim `detectLanguage` returns a string, but it returns undefined for a locale with
// no exact or two-letter match.
export function detectSystemLanguage(availableLanguages: string[]): string | undefined {
  for (const locale of getLocales()) {
    const language = detectLanguage(locale.languageTag, availableLanguages) as string | undefined;
    if (language) {
      return language;
    }
  }
  return undefined;
}

export const detectLanguageOrPreferred = (preferenceService: PreferenceService, availableLanguages: string[]) => {
  const preference = preferenceService.getPreferredLanguage();
  if (preference) {
    return preference;
  }
  return detectSystemLanguage(availableLanguages);
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
