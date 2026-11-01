import MonitorWeightIcon from '@expo/material-symbols/monitor_weight.xml';
import ReplayIcon from '@expo/material-symbols/replay.xml';
import TrophyIcon from '@expo/material-symbols/trophy.xml';
import ThemeChooser from '@/components/presentation/foundation/editors/theme-chooser';
import { RootState, useAppSelector } from '@/store';
import {
  setColorSchemeSeed,
  setShowAccomplishments,
  setShowBodyweight,
  setThemeMode,
  setTrueBlackDarkTheme,
} from '@/store/settings';
import { useTranslate } from '@tolgee/react';
import { useDispatch } from 'react-redux';
import { useRouter } from 'expo-router';
import { SettingsPage } from '@/components/layout/settings-page';
import { SegmentedGroup } from '@/components/presentation/foundation/segmented-list';
import { SegmentedListSwitch } from '@/components/presentation/foundation/segmented-list-switch';
import { SegmentedListLink } from '@/components/presentation/foundation/segmented-list-link';

export default function AppConfigurationPage() {
  const { t } = useTranslate();
  const settings = useAppSelector((state: RootState) => state.settings);
  const dispatch = useDispatch();
  const { push } = useRouter();

  return (
    <SettingsPage title={t('settings.app_configuration.title')} caption={t('settings.app_configuration.subtitle')}>
      <SegmentedGroup>
        <SegmentedListSwitch
          testID="setShowBodyweight"
          label={t('settings.show_bodyweight.label')}
          icon={MonitorWeightIcon}
          systemImage="figure"
          supportingText={t('settings.show_bodyweight.subtitle')}
          value={settings.showBodyweight}
          onValueChange={(value) => dispatch(setShowBodyweight(value))}
        />
        <SegmentedListSwitch
          testID="setShowAccomplishments"
          label={t('settings.show_accomplishments.label')}
          icon={TrophyIcon}
          systemImage="trophy"
          supportingText={t('settings.show_accomplishments.subtitle')}
          value={settings.showAccomplishments}
          onValueChange={(value) => dispatch(setShowAccomplishments(value))}
        />
      </SegmentedGroup>

      <ThemeChooser
        seed={settings.colorSchemeSeed}
        onUpdateTheme={(x) => dispatch(setColorSchemeSeed(x))}
        trueBlack={settings.trueBlackDarkTheme}
        setTrueBlack={(b) => dispatch(setTrueBlackDarkTheme(b))}
        themeMode={settings.themeMode}
        setThemeMode={(m) => dispatch(setThemeMode(m))}
      />

      <SegmentedGroup>
        <SegmentedListLink
          label={t('onboarding.start_setup_wizard.button')}
          icon={ReplayIcon}
          systemImage="arrow.counterclockwise"
          onPress={() => push('/welcome')}
        />
      </SegmentedGroup>
    </SettingsPage>
  );
}
