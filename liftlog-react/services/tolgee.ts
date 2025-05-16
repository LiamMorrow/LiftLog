import en from '../i18n/en.json';
import { DevTools, FormatSimple, Tolgee } from '@tolgee/react';

export const tolgee = Tolgee()
  // DevTools will work only for web view
  .use(DevTools())
  .use(FormatSimple())
  // replace with .use(FormatIcu()) for rendering plurals, formatted numbers, etc.
  .init({
    language: 'en',

    // for development
    // apiUrl: process.env.EXPO_PUBLIC_TOLGEE_API_URL!,
    // apiKey: process.env.EXPO_PUBLIC_TOLGEE_API_KEY!,
    staticData: {
      en,
    },
  });
