import FullScreenDialog from '@/components/presentation/full-screen-dialog';
import LimitedHtml from '@/components/presentation/limited-html';
import ListSwitch from '@/components/presentation/list-switch';
import SessionDiffView from '@/components/presentation/session-diff-view';
import { spacing } from '@/hooks/useAppTheme';
import {
  diffSessionBlueprints,
  EmptySessionBlueprintDiff,
  PlanDiff,
  SessionBlueprintDiff,
} from '@/models/blueprint-diff';
import { SessionBlueprint } from '@/models/blueprint-models';
import { EmptySession } from '@/models/session-models';
import { useAppSelector } from '@/store';
import { setCurrentPlanDiff } from '@/store/current-session';
import {
  applyDiffToPlan,
  fetchUpcomingSessions,
  selectNewWorkoutName,
} from '@/store/program';
import { useTranslate } from '@tolgee/react';
import { useState } from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { useDispatch } from 'react-redux';

/**
 * Creates a diff for updating an existing workout in the plan.
 * Compares the original session blueprint against the modified session.
 */
function createUpdateExistingWorkoutDiff(
  currentPlanDiff: PlanDiff,
): SessionBlueprintDiff {
  return diffSessionBlueprints(
    SessionBlueprint.fromPOJO(currentPlanDiff.diff.originalSession),
    SessionBlueprint.fromPOJO(currentPlanDiff.diff.newSession),
  );
}

/**
 * Creates a diff for adding a new workout to the plan.
 * Compares against an empty session so all exercises appear as "added".
 * Preserves the original session references for potential undo/comparison.
 */
function createAddNewWorkoutDiff(
  currentPlanDiff: PlanDiff,
  newWorkoutName: string,
): SessionBlueprintDiff {
  const newSessionWithName = SessionBlueprint.fromPOJO(
    currentPlanDiff.diff.newSession,
  ).with({ name: newWorkoutName });

  return {
    // Diff against empty session so everything shows as "added"
    ...diffSessionBlueprints(EmptySession.blueprint, newSessionWithName),
    // Preserve original references so we can use them again when we turn the switch off
    originalSession: currentPlanDiff.diff.originalSession,
    newSession: currentPlanDiff.diff.newSession,
  };
}

export function SessionDiffSaveDialog() {
  const dispatch = useDispatch();
  const { t } = useTranslate();
  const currentPlanDiff = useAppSelector(
    (x) => x.currentSession.currentPlanDiff,
  );
  const [selectedDiff, setSelectedDiff] = useState<SessionBlueprintDiff>();
  const newWorkoutName = useAppSelector(selectNewWorkoutName);

  // Track whether user has opted to create a new workout instead of updating existing
  const [isCreatingNewWorkout, setIsCreatingNewWorkout] = useState(false);

  // Can only edit existing if we have a diff (not an add operation)
  const canEditExistingWorkout = currentPlanDiff?.type === 'diff';

  // If user selected "create new" OR we can't edit existing, we're adding a new workout
  const saveAsNewWorkout = isCreatingNewWorkout || !canEditExistingWorkout;

  /**
   * Handles toggling between "update existing workout" and "save as new workout" modes.
   * Recalculates the diff based on the selected mode:
   * - Update existing: compares original → modified session
   * - Save as new: compares empty → modified session (shows all as additions)
   */
  const handleSaveModeChange = (createNew: boolean) => {
    if (!currentPlanDiff) return;

    setIsCreatingNewWorkout(createNew);

    const newDiff = createNew
      ? createAddNewWorkoutDiff(currentPlanDiff, newWorkoutName)
      : createUpdateExistingWorkoutDiff(currentPlanDiff);

    dispatch(setCurrentPlanDiff({ ...currentPlanDiff, diff: newDiff }));
  };

  const getSwitchSubtitle = (): string => {
    if (!canEditExistingWorkout || isCreatingNewWorkout) {
      return t('plan.diff.dialog_save_as_new_switch_on.subtitle', {
        newWorkoutName,
      });
    }
    return t('plan.diff.dialog_save_as_new_switch_off.subtitle', {
      originalSessionName: currentPlanDiff?.diff.originalSession.name,
    });
  };
  return (
    <FullScreenDialog
      open={!!currentPlanDiff}
      onClose={() => {
        dispatch(setCurrentPlanDiff(undefined));
      }}
      title={t('plan.diff.dialog.title')}
      action={t('generic.save.button')}
      onAction={() => {
        if (selectedDiff) {
          dispatch(
            applyDiffToPlan(
              saveAsNewWorkout
                ? { type: 'add', diff: selectedDiff }
                : { ...currentPlanDiff, diff: selectedDiff },
            ),
          );
        }
        dispatch(setCurrentPlanDiff(undefined));
        dispatch(fetchUpcomingSessions());
      }}
    >
      <Text
        style={{
          paddingBlockEnd: spacing[2],
        }}
        variant="bodyMedium"
      >
        {currentPlanDiff?.type === 'diff' ? (
          <LimitedHtml
            value={t('plan.diff.dialog_update.body', {
              originalSessionName: currentPlanDiff?.diff.originalSession.name,
            })}
          />
        ) : (
          t('plan.diff.dialog_add.body')
        )}
      </Text>
      <View style={{ marginHorizontal: -spacing.pageHorizontalMargin }}>
        {canEditExistingWorkout && (
          <ListSwitch
            value={isCreatingNewWorkout}
            supportingText={<LimitedHtml value={getSwitchSubtitle()} />}
            onValueChange={handleSaveModeChange}
            headline={t('plan.diff.dialog_save_as_new_switch.title')}
          />
        )}
      </View>
      <SessionDiffView
        diff={currentPlanDiff?.diff ?? EmptySessionBlueprintDiff}
        onSelectedDiffChange={setSelectedDiff}
      />
    </FullScreenDialog>
  );
}
