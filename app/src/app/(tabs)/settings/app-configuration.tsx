import AssignmentTurnedInIcon from '@expo/material-symbols/assignment_turned_in.xml';
import DescriptionIcon from '@expo/material-symbols/description.xml';
import HistoryIcon from '@expo/material-symbols/history.xml';
import MonitorWeightIcon from '@expo/material-symbols/monitor_weight.xml';
import NotesIcon from '@expo/material-symbols/notes.xml';
import ReplayIcon from '@expo/material-symbols/replay.xml';
import TrophyIcon from '@expo/material-symbols/trophy.xml';
import VisibilityIcon from '@expo/material-symbols/visibility.xml';
import ThemeChooser from '@/components/presentation/foundation/editors/theme-chooser';
import { RootState, useAppSelector } from '@/store';
import {
  setColorSchemeSeed,
  setKeepScreenAwakeDuringWorkout,
  setNotesExpandedByDefault,
  setShowPlanNotesInWorkout,
  setShowPreviousRepsInWorkout,
  setShowAccomplishments,
  setShowBodyweight,
  setShowPostWorkoutSummary,
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
        <SegmentedListSwitch
          label={t('workout.show_post_workout_summary.label')}
          icon={AssignmentTurnedInIcon}
          systemImage="checklist"
          supportingText={t('workout.show_post_workout_summary.subtitle')}
          value={settings.showPostWorkoutSummary}
          onValueChange={(value) => dispatch(setShowPostWorkoutSummary(value))}
        />
        <SegmentedListSwitch
          label={t('workout.notes_expanded_by_default.label')}
          icon={NotesIcon}
          systemImage="text.alignleft"
          supportingText={t('workout.notes_expanded_by_default.subtitle')}
          value={settings.notesExpandedByDefault}
          onValueChange={(value) => dispatch(setNotesExpandedByDefault(value))}
        />
        <SegmentedListSwitch
          testID="setShowPlanNotesInWorkout"
          label={t('workout.show_plan_notes.label')}
          icon={DescriptionIcon}
          systemImage="doc.text"
          supportingText={t('workout.show_plan_notes.subtitle')}
          value={settings.showPlanNotesInWorkout}
          onValueChange={(value) => dispatch(setShowPlanNotesInWorkout(value))}
        />
        <SegmentedListSwitch
          testID="setShowPreviousRepsInWorkout"
          label={t('workout.show_previous_reps.label')}
          icon={HistoryIcon}
          systemImage="clock.arrow.circlepath"
          supportingText={t('workout.show_previous_reps.subtitle')}
          value={settings.showPreviousRepsInWorkout}
          onValueChange={(value) => dispatch(setShowPreviousRepsInWorkout(value))}
        />
        <SegmentedListSwitch
          label={t('workout.keep_screen_awake.label')}
          icon={VisibilityIcon}
          systemImage="eye"
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
          icon={ReplayIcon}
          systemImage="arrow.counterclockwise"
          onPress={() => push('/welcome')}
        />
      </SegmentedGroup>
    </SettingsPage>
  );
}
