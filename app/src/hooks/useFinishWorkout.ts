import { useAppSelector, useAppSelectorWithArg } from '@/store';
import { finishCurrentWorkout, selectCurrentSession, SessionTarget, setCurrentPlanDiff } from '@/store/current-session';
import { getPlanDiff } from '@/store/current-session/helpers';
import { selectActiveProgram } from '@/store/program';
import { useDispatch } from 'react-redux';

/**
 * Finishes the current workout for the target and returns whether the saved session
 * differs from the active plan, so the caller can open the diff-save modal.
 */
export function useFinishWorkout(target: SessionTarget) {
  const dispatch = useDispatch();
  const session = useAppSelectorWithArg(selectCurrentSession, target);
  const program = useAppSelector(selectActiveProgram);
  const programId = useAppSelector((x) => x.program.activePlanId);
  return (): boolean => {
    const diff = session ? getPlanDiff(program, session, programId) : undefined;
    if (diff) {
      dispatch(setCurrentPlanDiff(diff));
    }
    dispatch(finishCurrentWorkout(target));
    return !!diff;
  };
}
