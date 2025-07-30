import {
  detectLanguage,
  LanguageDetectorMiddleware,
  TolgeePlugin,
} from '@tolgee/react';

const createLanguageDetector = (): LanguageDetectorMiddleware => ({
  getLanguage: (props) => {
    console.log(
      'Preferred language: ',
      Intl.DateTimeFormat().resolvedOptions().locale,
    );
    return detectLanguage(
      Intl.DateTimeFormat().resolvedOptions().locale,
      props.availableLanguages,
    );
  },
});

export const DetectLanguage = (): TolgeePlugin => (tolgee, tools) => {
  tools.setLanguageDetector(createLanguageDetector());
  return tolgee;
};
