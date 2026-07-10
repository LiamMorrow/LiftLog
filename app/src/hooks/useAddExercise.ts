import { getSessionExerciseEditorHref } from '@/components/smart/session-exercise-editor';
import { EmptyExerciseBlueprint } from '@/models/blueprint-models';
import { useAppSelector, useAppSelectorWithArg } from '@/store';
import { selectCurrentSession, SessionTarget, setCurrentSession } from '@/store/current-session';
import { useRouter } from 'expo-router';
import { useDispatch } from 'react-redux';

export function useAddExercise(target: SessionTarget) {
  const session = useAppSelectorWithArg(selectCurrentSession, target);
  const useImperialUnits = useAppSelector((x) => x.settings.useImperialUnits);
  const dispatch = useDispatch();
  const { push } = useRouter();

  return () => {
    if (!session) {
      return;
    }
    const newIndex = session.recordedExercises.length;
    dispatch(
      setCurrentSession({
        session: session.withAddedExercise(EmptyExerciseBlueprint.with({ name: 'New Exercise' }), useImperialUnits),
        target,
      }),
    );
    push(getSessionExerciseEditorHref(target, newIndex, { isNew: true }));
  };
}
