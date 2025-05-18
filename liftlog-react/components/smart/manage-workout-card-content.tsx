import SessionSummary from '@/components/presentation/session-summary';
import SessionSummaryTitle from '@/components/presentation/session-summary-title';
import SplitCardControl from '@/components/presentation/split-card-control';
import { SessionBlueprint } from '@/models/session-models';
import { useAppSelectorWithArg } from '@/store';
import {
  addProgramSession,
  moveSessionBlueprintDownInProgram,
  moveSessionBlueprintUpInProgram,
  removeSessionFromProgram,
  selectProgram,
} from '@/store/program';
import { useTranslate } from '@tolgee/react';
import { useState } from 'react';
import { IconButton, Menu } from 'react-native-paper';
import { useDispatch } from 'react-redux';

interface ManageWorkoutCardContentProps {
  sessionBlueprint: SessionBlueprint;
  programId: string;
}
export default function ManageWorkoutCardContent({
  sessionBlueprint,
  programId,
}: ManageWorkoutCardContentProps) {
  const session = sessionBlueprint.getEmptySession();
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
  const removeSession = () =>
    dispatch(
      removeSessionFromProgram({
        programId,
        sessionBlueprint: sessionBlueprint,
      }),
    );
  const duplicateSession = () =>
    dispatch(
      addProgramSession({
        programId,
        sessionBlueprint: sessionBlueprint.with({
          name: `${t('Workout')} ${plan.sessions.length + 1}`,
        }),
      }),
    );
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
          title={t('Remove')}
        />
        <Menu.Item
          title={t('Duplicate')}
          leadingIcon={'contentCopy'}
          onPress={() => {
            setMenuOpen(false);
            duplicateSession();
          }}
        />
      </Menu>
    </>
  );
}
