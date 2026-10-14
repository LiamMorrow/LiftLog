import ThemeChooser from '@/components/presentation/foundation/editors/theme-chooser';
import { RootState, useAppSelector } from '@/store';
import {
  setColorSchemeSeed,
  setKeepScreenAwakeDuringWorkout,
  setNotesExpandedByDefault,
  setShowBodyweight,
  setShowFeed,
  setShowPostWorkoutSummary,
  setThemeMode,
  setTrueBlackDarkTheme,
  setWelcomeWizardCompleted,
} from '@/store/settings';
import { useTranslate } from '@tolgee/react';
import { useDispatch } from 'react-redux';
import { SettingsPage } from '@/components/layout/settings-page';
import { SegmentedGroup } from '@/components/presentation/foundation/segmented-list';
import { SegmentedListSwitch } from '@/components/presentation/foundation/segmented-list-switch';
import { SegmentedListLink } from '@/components/presentation/foundation/segmented-list-link';

export default function AppConfigurationPage() {
  const { t } = useTranslate();
  const settings = useAppSelector((state: RootState) => state.settings);
  const dispatch = useDispatch();

  return (
    <SettingsPage title={t('settings.app_configuration.title')} caption={t('settings.app_configuration.subtitle')}>
      <SegmentedGroup>
        <SegmentedListSwitch
          testID="setShowBodyweight"
          label={t('settings.show_bodyweight.label')}
          icon={'monitorWeightFill'}
          supportingText={t('settings.show_bodyweight.subtitle')}
          value={settings.showBodyweight}
          onValueChange={(value) => dispatch(setShowBodyweight(value))}
        />
        <SegmentedListSwitch
          label={t('feed.show_feed.label')}
          icon={'forum'}
          supportingText={t('feed.show_feed.subtitle')}
          value={settings.showFeed}
          onValueChange={(value) => dispatch(setShowFeed(value))}
        />
        <SegmentedListSwitch
          label={t('workout.show_post_workout_summary.label')}
          icon={'assignmentTurnedIn'}
          supportingText={t('workout.show_post_workout_summary.subtitle')}
          value={settings.showPostWorkoutSummary}
          onValueChange={(value) => dispatch(setShowPostWorkoutSummary(value))}
        />
        <SegmentedListSwitch
          label={t('workout.notes_expanded_by_default.label')}
          icon={'notes'}
          supportingText={t('workout.notes_expanded_by_default.subtitle')}
          value={settings.notesExpandedByDefault}
          onValueChange={(value) => dispatch(setNotesExpandedByDefault(value))}
        />
        <SegmentedListSwitch
          label={t('workout.keep_screen_awake.label')}
          icon={'visibility'}
          supportingText={t('workout.keep_screen_awake.subtitle')}
          value={settings.keepScreenAwakeDuringWorkout}
          onValueChange={(value) => dispatch(setKeepScreenAwakeDuringWorkout(value))}
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
          icon={'replay'}
          onPress={() => dispatch(setWelcomeWizardCompleted(false))}
        />
      </SegmentedGroup>
    </SettingsPage>
  );
}
