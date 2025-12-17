import ConfirmationDialog from '@/components/presentation/confirmation-dialog';
import IconButton from '@/components/presentation/gesture-wrappers/icon-button';
import LimitedHtml from '@/components/presentation/limited-html';
import { SurfaceText } from '@/components/presentation/surface-text';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Session } from '@/models/session-models';
import { useAppSelector } from '@/store';
import { showSnackbar } from '@/store/app';
import { SessionTarget, setCurrentSession } from '@/store/current-session';
import {
  addProgramSession,
  removeSessionFromProgram,
  selectActiveProgram,
  setProgramSession,
} from '@/store/program';
import { T, useTranslate } from '@tolgee/react';
import { useState } from 'react';
import { View } from 'react-native';
import { Tooltip } from 'react-native-paper';
import { useDispatch } from 'react-redux';

interface UpdatePlanDialogProps {
  session: Session;
  target: SessionTarget;
}
export default function UpdatePlanButton({
  session,
  target,
}: UpdatePlanDialogProps) {
  const [open, setOpen] = useState(false);
  const onClose = () => setOpen(false);
  const { colors } = useAppTheme();
  const { t } = useTranslate();
  const program = useAppSelector(selectActiveProgram);
  const programId = useAppSelector((x) => x.program.activeProgramId);
  const dispatch = useDispatch();
  const sessionInPlan = program.sessions.some((x) =>
    x.equals(session.blueprint),
  );
  const sessionWithSameNameInPlan = program.sessions.some(
    (x) => x.name === session.blueprint.name,
  );
  const onUpdate = () => {
    const blueprintIndex = program.sessions.findIndex(
      (x) => x.name === session.blueprint.name,
    );
    dispatch(
      setProgramSession({
        programId: programId,
        sessionBlueprint: session.blueprint,
        sessionIndex: blueprintIndex,
      }),
    );
    dispatch(
      showSnackbar({
        text: t('plan.updated.message'),
        action: t('generic.undo.button'),
        dispatchAction: setProgramSession({
          programId: programId,
          sessionBlueprint: program.sessions[blueprintIndex],
          sessionIndex: blueprintIndex,
        }),
      }),
    );
    onClose();
  };
  const onAdd = () => {
    let blueprint = session.blueprint;
    if (sessionWithSameNameInPlan) {
      const blueprintNameWithoutNumber = blueprint.name.replace(
        / \(\d+\)$/,
        '',
      );
      let newName = blueprint.name;
      let i = 1;

      while (program.sessions.some((x) => x.name === newName)) {
        newName = `${blueprintNameWithoutNumber} (${i})`;
        i++;
      }

      blueprint = blueprint.with({ name: newName });
    }
    dispatch(
      setCurrentSession({ target, session: session.with({ blueprint }) }),
    );
    dispatch(
      addProgramSession({ programId: programId, sessionBlueprint: blueprint }),
    );
    dispatch(
      showSnackbar({
        text: t('workout.added_to_plan.message'),
        action: t('generic.undo.button'),
        dispatchAction: [
          removeSessionFromProgram({
            programId: programId,
            sessionBlueprint: blueprint,
          }),
          setCurrentSession({ target, session: session }),
        ],
      }),
    );
    onClose();
  };
  const updateProps = sessionWithSameNameInPlan
    ? {
        okText: t('generic.update.button'),
        onOk: onUpdate,
        additionalActionText: t('generic.add.button'),
        onAdditionalAction: onAdd,
      }
    : {
        onOk: onAdd,
        okText: t('generic.add.button'),
      };
  const onCancel = onClose;
  return (
    <View>
      {!sessionInPlan ? (
        session.recordedExercises.length > 0 ? (
          <Tooltip title={t('plan.update.button')}>
            <IconButton
              style={{ backgroundColor: colors.surface }}
              onPress={() => setOpen(true)}
              icon={'assignmentAdd'}
            />
          </Tooltip>
        ) : null
      ) : undefined}
      <ConfirmationDialog
        headline={t('plan.update.button')}
        open={open}
        onCancel={onCancel}
        {...updateProps}
        textContent={
          <SurfaceText>
            <T keyName="plan.will_be_updated.message" />{' '}
            {sessionWithSameNameInPlan ? (
              <LimitedHtml
                value={t('workout.update_existing.confirm.body', {
                  name: session.blueprint.name,
                })}
              />
            ) : undefined}
          </SurfaceText>
        }
      />
    </View>
  );
}
