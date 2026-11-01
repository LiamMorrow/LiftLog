import { useAppSelector } from '@/store';
import { setPreferredLanguage } from '@/store/settings';
import { getSystemLanguage, hasSystemLanguagePicker } from '@/utils/system-language';
import { useLocales } from 'expo-localization';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

export function useSystemLanguageSync() {
  const dispatch = useDispatch();
  const systemLanguages = useLocales()
    .map((locale) => locale.languageTag)
    .join();
  const isHydrated = useAppSelector((state) => state.settings.isHydrated);
  const preferredLanguage = useAppSelector((state) => state.settings.preferredLanguage);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }
    const language = hasSystemLanguagePicker() ? getSystemLanguage() : preferredLanguage;
    if (language === undefined || language !== preferredLanguage) {
      dispatch(setPreferredLanguage(language));
    }
  }, [dispatch, isHydrated, preferredLanguage, systemLanguages]);
}
