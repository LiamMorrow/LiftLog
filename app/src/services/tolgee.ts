import { DetectLanguage, detectLanguageOrPreferred } from '@/utils/language-detector';

import ar from '../i18n/ar.json';
import cs from '../i18n/cs.json';
import de from '../i18n/de.json';
import en from '../i18n/en.json';
import es from '../i18n/es.json';
import fi from '../i18n/fi.json';
import fr from '../i18n/fr.json';
import hu from '../i18n/hu.json';
import it from '../i18n/it.json';
import ko from '../i18n/ko.json';
import nl from '../i18n/nl.json';
import pl from '../i18n/pl.json';
import pt from '../i18n/pt.json';
import ru from '../i18n/ru.json';
import sr from '../i18n/sr.json';
import sv from '../i18n/sv.json';
import tr from '../i18n/tr.json';
import uk from '../i18n/uk.json';
import zh_Hans from '../i18n/zh-hans.json';

import { FormatSimple, Tolgee } from '@tolgee/react';
import { PreferenceService } from '@/services/preference-service';

export const supportedLanguages = [
  { translationJson: ar, code: 'ar', label: 'العربية', englishName: 'Arabic', isRTL: true },
  { translationJson: sv, code: 'sv', label: 'Svenska', englishName: 'Swedish' },
  { translationJson: de, code: 'de', label: 'Deutsch', englishName: 'German' },
  { translationJson: en, code: 'en', label: 'English', englishName: 'English' },
  { translationJson: es, code: 'es', label: 'Español', englishName: 'Spanish' },
  { translationJson: fi, code: 'fi', label: 'Suomi', englishName: 'Finnish' },
  { translationJson: fr, code: 'fr', label: 'Français', englishName: 'French' },
  { translationJson: it, code: 'it', label: 'Italiano', englishName: 'Italian' },
  { translationJson: nl, code: 'nl', label: 'Nederlands', englishName: 'Dutch' },
  { translationJson: hu, code: 'hu', label: 'Magyar', englishName: 'Hungarian' },
  { translationJson: ru, code: 'ru', label: 'Русский', englishName: 'Russian' },
  { translationJson: sr, code: 'sr', label: 'Srpski', englishName: 'Serbian' },
  { translationJson: uk, code: 'uk', label: 'Українська', englishName: 'Ukrainian' },
  { translationJson: pt, code: 'pt', label: 'Português', englishName: 'Portuguese' },
  { translationJson: pl, code: 'pl', label: 'Polski', englishName: 'Polish' },
  { translationJson: cs, code: 'cs', label: 'Čeština', englishName: 'Czech' },
  { translationJson: ko, code: 'ko', label: '한국어', englishName: 'Korean' },
  { translationJson: tr, code: 'tr', label: 'Türkçe', englishName: 'Turkish' },
  { translationJson: zh_Hans, code: 'zh-hans', label: '中文（简体）', englishName: 'Chinese (Simplified)' },
];

export const getTolgee = (preferenceService: PreferenceService) =>
  Tolgee()
    .use(FormatSimple())
    .use(DetectLanguage(preferenceService))
    .init({
      defaultLanguage: 'en',
      fallbackLanguage: 'en',
      language: detectLanguageOrPreferred(
        preferenceService,
        supportedLanguages.map((x) => x.code),
      ),

      staticData: supportedLanguages.reduce((acc, next) => ({ ...acc, [next.code]: next.translationJson }), {}),
    });
