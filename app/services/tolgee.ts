import {
  DetectLanguage,
  detectLanguageOrPreferred,
} from '@/utils/language-detector';
import de from '../i18n/de.json';
import en from '../i18n/en.json';
import es from '../i18n/es.json';
import fi from '../i18n/fi.json';
import fr from '../i18n/fr.json';
import it from '../i18n/it.json';
import nl from '../i18n/nl.json';
import ru from '../i18n/ru.json';
import sr from '../i18n/sr.json';
import uk from '../i18n/uk.json';
import pt from '../i18n/pt.json';
import ar from '../i18n/ar.json';
import sv from '../i18n/sv.json';
import pl from '../i18n/pl.json';
import { DevTools, FormatSimple, Tolgee } from '@tolgee/react';
import { PreferenceService } from '@/services/preference-service';

export const supportedLanguages = [
  { translationJson: ar, code: 'ar', label: 'العربية', isRTL: true },
  { translationJson: sv, code: 'sv', label: 'Svenska' },
  { translationJson: de, code: 'de', label: 'Deutsch' },
  { translationJson: en, code: 'en', label: 'English' },
  { translationJson: es, code: 'es', label: 'Español' },
  { translationJson: fi, code: 'fi', label: 'Suomi' },
  { translationJson: fr, code: 'fr', label: 'Français' },
  { translationJson: it, code: 'it', label: 'Italiano' },
  { translationJson: nl, code: 'nl', label: 'Nederlands' },
  { translationJson: ru, code: 'ru', label: 'Русский' },
  { translationJson: sr, code: 'sr', label: 'Srpski' },
  { translationJson: uk, code: 'uk', label: 'Українська' },
  { translationJson: pt, code: 'pt', label: 'Português' },
  { translationJson: pl, code: 'pl', label: 'Polski' },
];

export const getTolgee = (preferenceService: PreferenceService) =>
  Tolgee()
    // DevTools will work only for web view
    .use(DevTools())
    .use(FormatSimple())
    .use(DetectLanguage(preferenceService))
    .init({
      defaultLanguage: 'en',
      fallbackLanguage: 'en',
      language: detectLanguageOrPreferred(
        preferenceService,
        supportedLanguages.map((x) => x.code),
      ),

      staticData: supportedLanguages.reduce(
        (acc, next) => ({ ...acc, [next.code]: next.translationJson }),
        {},
      ),
    });
