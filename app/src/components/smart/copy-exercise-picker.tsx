import FullHeightScrollView from '@/components/layout/full-height-scroll-view';
import EmptyInfo from '@/components/presentation/foundation/empty-info';
import Form from '@/components/presentation/foundation/form';
import { PageCaption } from '@/components/presentation/foundation/page-caption';
import { SegmentedGroup, SegmentListFormElement } from '@/components/presentation/foundation/segmented-list';
import { useAppSelector, useAppSelectorWithArg } from '@/store';
import { showSnackbar } from '@/store/app';
import { selectProgram, selectProgramSessionExercise, setProgramSession } from '@/store/program';
import { useTranslate } from '@tolgee/react';
import { Href, Stack, useRouter } from 'expo-router';
import { useDispatch } from 'react-redux';

interface CopyExercisePickerProps {
  programId: string;
  sessionIndex: number;
  exerciseIndex: number;
}

export const getCopyExerciseHref = ({ programId, sessionIndex, exerciseIndex }: CopyExercisePickerProps): Href => ({
  pathname: '/copy-exercise',
  params: { programId, sessionIndex, exerciseIndex },
});

export function CopyExercisePicker({ programId, sessionIndex, exerciseIndex }: CopyExercisePickerProps) {
  const { t } = useTranslate();
  const dispatch = useDispatch();
  const { dismiss } = useRouter();
  const program = useAppSelectorWithArg(selectProgram, programId);
  const exercise = useAppSelector((x) => selectProgramSessionExercise(x, { programId, sessionIndex, exerciseIndex }));
  const otherSessions = program.sessions
    .map((session, index) => ({ session, index }))
    .filter(({ index }) => index !== sessionIndex);

  if (!exercise) {
    return null;
  }

  const copyTo = (targetIndex: number) => {
    const target = program.sessions[targetIndex];
    if (!target) {
      return;
    }
    dispatch(
      setProgramSession({
        programId,
        sessionIndex: targetIndex,
        sessionBlueprint: target.with({ exercises: [...target.exercises, exercise] }),
      }),
    );
    dispatch(
      showSnackbar({
        text: t('exercise.copied_to_session.message', {
          exerciseName: exercise.name,
          targetSessionName: target.name,
        }),
      }),
    );
    dismiss();
  };

  return (
    <FullHeightScrollView modal>
      <Stack.Screen options={{ title: t('exercise.copy_to_session.button') }} />
      <PageCaption value={t('exercise.copy_to_session.select_session.label', { exerciseName: exercise.name })} />
      <Form>
        {otherSessions.length === 0 ? (
          <EmptyInfo>{t('plan.no_other_sessions_available.message')}</EmptyInfo>
        ) : (
          <SegmentedGroup>
            {otherSessions.map(({ session, index }) => (
              <SegmentListFormElement
                key={index}
                label={session.name}
                supportingText={t(session.exercises.length === 1 ? 'plan.summary.exercise' : 'plan.summary.exercises', {
                  count: session.exercises.length,
                })}
                onPress={() => copyTo(index)}
              />
            ))}
          </SegmentedGroup>
        )}
      </Form>
    </FullHeightScrollView>
  );
}
