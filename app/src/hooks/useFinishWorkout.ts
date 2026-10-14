import { useAppSelector, useAppSelectorWithArg } from '@/store';
import { getPlanDiff } from '@/store/program/helpers';
import { selectActiveProgram, setPendingPlanDiff } from '@/store/program';
import { selectSession, sessionFinished } from '@/store/stored-sessions';
import { useDispatch } from 'react-redux';

/**
 * Finishes the given session and returns whether the saved session
 * differs from the active plan, so the caller can open the diff-save modal.
 */
export function useFinishWorkout(sessionId: string | undefined) {
  const dispatch = useDispatch();
  const session = useAppSelectorWithArg(selectSession, sessionId ?? '');
  const program = useAppSelector(selectActiveProgram);
  const programId = useAppSelector((x) => x.program.activePlanId);
  return (): boolean => {
    if (!sessionId || !session) {
      return false;
    }
    const diff = getPlanDiff(program, session, programId);
    if (diff) {
      dispatch(setPendingPlanDiff(diff));
    }
    dispatch(sessionFinished(sessionId));
    return !!diff;
  };
}
