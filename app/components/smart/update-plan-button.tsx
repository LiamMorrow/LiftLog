import ConfirmationDialog from '@/components/presentation/confirmation-dialog';
import LimitedHtml from '@/components/presentation/limited-html';
import { SurfaceText } from '@/components/presentation/surface-text';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Session } from '@/models/session-models';
import { useAppSelector } from '@/store';
import { SessionTarget, setCurrentSession } from '@/store/current-session';
import {
  addProgramSession,
  selectActiveProgram,
  setProgramSession,
} from '@/store/program';
import { T, useTranslate } from '@tolgee/react';
import { useState } from 'react';
import { View } from 'react-native';
import { IconButton, Tooltip } from 'react-native-paper';
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
    onClose();
  };
  const updateProps = sessionWithSameNameInPlan
    ? {
        onAdditionalAction: () => {
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
          onClose();
        },
        additionalActionText: t('Update'),
      }
    : undefined;
  const onCancel = onClose;
  return (
    <View>
      {!sessionInPlan ? (
        session.recordedExercises.length > 0 ? (
          <Tooltip title={t('UpdatePlan')}>
            <IconButton
              style={{ backgroundColor: colors.surface }}
              onPress={() => setOpen(true)}
              icon={'assignmentAdd'}
            />
          </Tooltip>
        ) : null
      ) : undefined}
      <ConfirmationDialog
        headline={t('UpdatePlan')}
        open={open}
        onCancel={onCancel}
        onOk={onAdd}
        okText={t('Add')}
        {...updateProps}
        textContent={
          <SurfaceText>
            <T keyName="PlanWillBeUpdated" />{' '}
            {sessionWithSameNameInPlan ? (
              <LimitedHtml
                value={t('UpdateExistingWorkout{Name}', {
                  0: session.blueprint.name,
                })}
              />
            ) : undefined}
          </SurfaceText>
        }
      />
    </View>
  );
}
