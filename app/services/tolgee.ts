import de from '../i18n/de.json';
import en from '../i18n/en.json';
import es from '../i18n/es.json';
import fi from '../i18n/fi.json';
import fr from '../i18n/fr.json';
import it from '../i18n/it.json';
import nl from '../i18n/nl.json';
import ru from '../i18n/ru.json';
import sr from '../i18n/sr.json';

import { DevTools, FormatSimple, Tolgee } from '@tolgee/react';

export const tolgee = Tolgee()
  // DevTools will work only for web view
  .use(DevTools())
  .use(FormatSimple())
  // replace with .use(FormatIcu()) for rendering plurals, formatted numbers, etc.
  .init({
    defaultLanguage: 'en',
    fallbackLanguage: 'en',
    // // for development
    // apiUrl: process.env.EXPO_PUBLIC_TOLGEE_API_URL!,
    // apiKey: process.env.EXPO_PUBLIC_TOLGEE_API_KEY!,
    staticData: {
      de,
      en,
      es,
      fi,
      fr,
      it,
      nl,
      ru,
      sr,
    },
  });
