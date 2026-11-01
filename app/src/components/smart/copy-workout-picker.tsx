import FullHeightScrollView from '@/components/layout/full-height-scroll-view';
import EmptyInfo from '@/components/presentation/foundation/empty-info';
import Form from '@/components/presentation/foundation/form';
import { PageCaption } from '@/components/presentation/foundation/page-caption';
import { SegmentedGroup, SegmentListFormElement } from '@/components/presentation/foundation/segmented-list';
import { useAppSelector } from '@/store';
import { showSnackbar } from '@/store/app';
import { addProgramSession, selectAllPrograms, selectProgramSession } from '@/store/program';
import { useTranslate } from '@tolgee/react';
import { Href, Stack, useRouter } from 'expo-router';
import { useDispatch } from 'react-redux';

interface CopyWorkoutPickerProps {
  programId: string;
  sessionIndex: number;
}

export const getCopyWorkoutHref = ({ programId, sessionIndex }: CopyWorkoutPickerProps): Href => ({
  pathname: '/copy-workout',
  params: { programId, sessionIndex },
});

export function CopyWorkoutPicker({ programId, sessionIndex }: CopyWorkoutPickerProps) {
  const { t } = useTranslate();
  const dispatch = useDispatch();
  const { dismiss } = useRouter();
  const allPrograms = useAppSelector(selectAllPrograms);
  const session = useAppSelector((x) => selectProgramSession(x, { programId, sessionIndex }));
  const otherPrograms = allPrograms.filter(({ id }) => id !== programId);

  if (!session) {
    return null;
  }

  const copyTo = (targetId: string, targetName: string) => {
    dispatch(addProgramSession({ programId: targetId, sessionBlueprint: session }));
    dispatch(showSnackbar({ text: t('workout.copied_to_plan.message', { planName: targetName }) }));
    dismiss();
  };

  return (
    <FullHeightScrollView modal>
      <Stack.Screen options={{ title: t('workout.copy_to_plan.button') }} />
      <PageCaption value={t('workout.copy_to_plan.select_plan.label', { workoutName: session.name })} />
      <Form>
        {otherPrograms.length === 0 ? (
          <EmptyInfo>{t('plan.no_other_available.message')}</EmptyInfo>
        ) : (
          <SegmentedGroup>
            {otherPrograms.map(({ id, program }) => (
              <SegmentListFormElement
                key={id}
                label={program.name}
                supportingText={t(program.sessions.length === 1 ? 'plan.summary.day' : 'plan.summary.days', {
                  count: program.sessions.length,
                })}
                onPress={() => copyTo(id, program.name)}
              />
            ))}
          </SegmentedGroup>
        )}
      </Form>
    </FullHeightScrollView>
  );
}
