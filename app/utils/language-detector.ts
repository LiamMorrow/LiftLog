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

const createLanguageDetector = (
  preferenceService: PreferenceService,
): LanguageDetectorMiddleware => ({
  getLanguage: async (props) => {
    const preference = await preferenceService.getPreferredLanguage();
    if (preference) {
      return preference;
    }
    return detectLanguageFromDateLocale(props.availableLanguages);
  },
});

export const DetectLanguage =
  (preferenceService: PreferenceService): TolgeePlugin =>
  (tolgee, tools) => {
    tools.setLanguageDetector(createLanguageDetector(preferenceService));
    return tolgee;
  };
