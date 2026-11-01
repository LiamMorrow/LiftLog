import { SettingsPage } from '@/components/layout/settings-page';
import { SegmentedGroup } from '@/components/presentation/foundation/segmented-list';
import { SegmentedListOption } from '@/components/presentation/foundation/segmented-list-option';
import { supportedLanguages } from '@/services/tolgee';
import { useAppSelector } from '@/store';
import { setPreferredLanguage } from '@/store/settings';
import { useTranslate } from '@tolgee/react';
import { useRouter } from 'expo-router';
import { useDispatch } from 'react-redux';

export default function LanguagePage() {
  const { t } = useTranslate();
  const { dismiss } = useRouter();
  const dispatch = useDispatch();
  const preferredLanguage = useAppSelector((state) => state.settings.preferredLanguage);
  const select = (code: string | undefined) => {
    dispatch(setPreferredLanguage(code));
    dismiss();
  };

  return (
    <SettingsPage title={t('settings.set_language.button')} modal>
      <SegmentedGroup>
        <SegmentedListOption
          testID="language-system-default"
          label={t('settings.system_default.label')}
          selected={preferredLanguage === undefined}
          onPress={() => select(undefined)}
        />
      </SegmentedGroup>
      <SegmentedGroup>
        {supportedLanguages.map((language) => (
          <SegmentedListOption
            key={language.code}
            testID={`language-${language.code}`}
            label={language.label}
            supportingText={language.englishName === language.label ? undefined : language.englishName}
            selected={preferredLanguage === language.code}
            onPress={() => select(language.code)}
          />
        ))}
      </SegmentedGroup>
    </SettingsPage>
  );
}
