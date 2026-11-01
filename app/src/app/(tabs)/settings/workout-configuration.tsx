import AssignmentTurnedInIcon from '@expo/material-symbols/assignment_turned_in.xml';
import DescriptionIcon from '@expo/material-symbols/description.xml';
import HistoryIcon from '@expo/material-symbols/history.xml';
import NotesIcon from '@expo/material-symbols/notes.xml';
import VisibilityIcon from '@expo/material-symbols/visibility.xml';
import { RootState, useAppSelector } from '@/store';
import {
  setKeepScreenAwakeDuringWorkout,
  setNotesExpandedByDefault,
  setShowPlanNotesInWorkout,
  setShowPreviousRepsInWorkout,
  setShowPostWorkoutSummary,
} from '@/store/settings';
import { useTranslate } from '@tolgee/react';
import { useDispatch } from 'react-redux';
import { SettingsPage } from '@/components/layout/settings-page';
import { SegmentedGroup } from '@/components/presentation/foundation/segmented-list';
import { SegmentedListSwitch } from '@/components/presentation/foundation/segmented-list-switch';

export default function WorkoutConfigurationPage() {
  const { t } = useTranslate();
  const settings = useAppSelector((state: RootState) => state.settings);
  const dispatch = useDispatch();

  return (
    <SettingsPage
      title={t('settings.workout_configuration.title')}
      caption={t('settings.workout_configuration.subtitle')}
    >
      <SegmentedGroup>
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

      <SegmentedGroup>
        <SegmentedListSwitch
          label={t('workout.show_post_workout_summary.label')}
          icon={AssignmentTurnedInIcon}
          systemImage="checklist"
          supportingText={t('workout.show_post_workout_summary.subtitle')}
          value={settings.showPostWorkoutSummary}
          onValueChange={(value) => dispatch(setShowPostWorkoutSummary(value))}
        />
      </SegmentedGroup>
    </SettingsPage>
  );
}
