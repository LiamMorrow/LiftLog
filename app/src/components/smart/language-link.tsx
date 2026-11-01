import LanguageIcon from '@expo/material-symbols/language.xml';
import { SegmentedListLink } from '@/components/presentation/foundation/segmented-list-link';
import { supportedLanguages } from '@/services/tolgee';
import { useAppSelector } from '@/store';
import { useTranslate } from '@tolgee/react';
import { useRouter } from 'expo-router';

export function LanguageLink(props: { testID?: string }) {
  const { t } = useTranslate();
  const { push } = useRouter();
  const preferredLanguage = useAppSelector((state) => state.settings.preferredLanguage);
  const value =
    supportedLanguages.find((language) => language.code === preferredLanguage)?.label ??
    t('settings.system_default.label');

  return (
    <SegmentedListLink
      testID={props.testID}
      icon={LanguageIcon}
      systemImage="globe"
      label={t('settings.set_language.button')}
      supportingText={t('settings.set_language.subtitle')}
      value={value}
      onPress={() => push('/language')}
    />
  );
}
