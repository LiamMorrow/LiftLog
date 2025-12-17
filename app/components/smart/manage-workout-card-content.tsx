import IconButton from '@/components/presentation/gesture-wrappers/icon-button';
import SessionSummary from '@/components/presentation/session-summary';
import SessionSummaryTitle from '@/components/presentation/session-summary-title';
import SplitCardControl from '@/components/presentation/split-card-control';
import CopyWorkoutDialog from '@/components/smart/copy-workout-dialog';
import { usePreferredWeightUnit } from '@/hooks/usePreferredWeightUnit';
import { SessionBlueprint } from '@/models/blueprint-models';
import { Session } from '@/models/session-models';
import { useAppSelectorWithArg } from '@/store';
import { showSnackbar } from '@/store/app';
import {
  addProgramSession,
  moveSessionBlueprintDownInProgram,
  moveSessionBlueprintUpInProgram,
  removeSessionFromProgram,
  selectProgram,
  setProgramSessions,
} from '@/store/program';
import { useTranslate } from '@tolgee/react';
import { useState } from 'react';
import { Menu } from 'react-native-paper';
import { useDispatch } from 'react-redux';

interface ManageWorkoutCardContentProps {
  sessionBlueprint: SessionBlueprint;
  programId: string;
}
export default function ManageWorkoutCardContent({
  sessionBlueprint,
  programId,
}: ManageWorkoutCardContentProps) {
  const preferredWeightUnit = usePreferredWeightUnit();
  const session = Session.getEmptySession(
    sessionBlueprint,
    preferredWeightUnit,
  );
  return (
    <SplitCardControl
      titleContent={<SessionSummaryTitle session={session} isFilled={false} />}
      mainContent={
        <SessionSummary isFilled={false} session={session} showWeight={false} />
      }
      actions={
        <Actions programId={programId} sessionBlueprint={sessionBlueprint} />
      }
    />
  );
}

function Actions({
  programId,
  sessionBlueprint,
}: ManageWorkoutCardContentProps) {
  const dispatch = useDispatch();
  const plan = useAppSelectorWithArg(selectProgram, programId);
  const { t } = useTranslate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [copyDialogOpen, setCopyDialogOpen] = useState(false);
  const moveSessionUp = () =>
    dispatch(
      moveSessionBlueprintUpInProgram({
        programId,
        sessionBlueprint: sessionBlueprint,
      }),
    );
  const moveSessionDown = () =>
    dispatch(
      moveSessionBlueprintDownInProgram({
        programId,
        sessionBlueprint: sessionBlueprint,
      }),
    );
  const removeSession = () => {
    const currentSessions = plan.sessions;
    dispatch(
      removeSessionFromProgram({
        programId,
        sessionBlueprint: sessionBlueprint,
      }),
    );
    dispatch(
      showSnackbar({
        text: t('workout.removed.message'),
        action: t('generic.undo.button'),
        dispatchAction: setProgramSessions({
          programId,
          sessionBlueprints: currentSessions,
        }),
      }),
    );
  };
  const duplicateSession = () => {
    const currentSessions = plan.sessions;
    dispatch(
      showSnackbar({
        text: t('workout.duplicated.message'),
        action: t('generic.undo.button'),
        dispatchAction: setProgramSessions({
          programId,
          sessionBlueprints: currentSessions,
        }),
      }),
    );
    dispatch(
      addProgramSession({
        programId,
        sessionBlueprint: sessionBlueprint.with({
          name: `${t('workout.workout.label')} ${plan.sessions.length + 1}`,
        }),
      }),
    );
  };
  return (
    <>
      <IconButton onPress={moveSessionUp} icon={'arrowUpward'} />
      <IconButton onPress={moveSessionDown} icon={'arrowDownward'} />
      <Menu
        visible={menuOpen}
        onDismiss={() => setMenuOpen(false)}
        anchor={
          <IconButton onPress={() => setMenuOpen(true)} icon={'moreHoriz'} />
        }
      >
        <Menu.Item
          onPress={() => {
            setMenuOpen(false);
            removeSession();
          }}
          leadingIcon={'delete'}
          title={t('generic.remove.button')}
        />
        <Menu.Item
          title={t('generic.duplicate.button')}
          leadingIcon={'contentCopy'}
          onPress={() => {
            setMenuOpen(false);
            duplicateSession();
          }}
        />
        <Menu.Item
          title={t('exercise.copy_to.button')}
          leadingIcon={'copyAll'}
          onPress={() => {
            setMenuOpen(false);
            setCopyDialogOpen(true);
          }}
        />
      </Menu>
      <CopyWorkoutDialog
        visible={copyDialogOpen}
        onDismiss={() => setCopyDialogOpen(false)}
        sessionBlueprint={sessionBlueprint}
        currentProgramId={programId}
      />
    </>
  );
}
