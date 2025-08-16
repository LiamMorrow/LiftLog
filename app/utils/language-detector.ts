import { PreferenceService } from '@/services/preference-service';
import {
  detectLanguage,
  LanguageDetectorMiddleware,
  TolgeePlugin,
} from '@tolgee/react';

const createLanguageDetector = (
  preferenceService: PreferenceService,
): LanguageDetectorMiddleware => ({
  getLanguage: async (props) => {
    const preference = await preferenceService.getPreferredLanguage();
    if (preference) {
      return preference;
    }
    console.log(
      'Detected language: ',
      Intl.DateTimeFormat().resolvedOptions().locale,
    );
    return detectLanguage(
      Intl.DateTimeFormat().resolvedOptions().locale,
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
