import { diffSessionBlueprints, PlanDiff } from '@/models/blueprint-diff';
import { ProgramBlueprint } from '@/models/blueprint-models';
import { EmptySession, Session } from '@/models/session-models';

/**
 * Computes how a finished session differs from the active plan, or `undefined`
 * if the session already matches a workout in the plan.
 */
export function getPlanDiff(program: ProgramBlueprint, session: Session, programId: string): PlanDiff | undefined {
  const sessionInPlan = program.sessions.some((x) => x.equals(session.blueprint));
  if (sessionInPlan) {
    return undefined;
  }

  const sessionWithSameNameInPlan = program.sessions.find((x) => x.name === session.blueprint.name);
  return sessionWithSameNameInPlan
    ? {
        type: 'diff',
        programId,
        diff: diffSessionBlueprints(sessionWithSameNameInPlan, session.blueprint),
        sessionIndex: program.sessions.indexOf(sessionWithSameNameInPlan),
      }
    : {
        type: 'add',
        programId,
        diff: diffSessionBlueprints(EmptySession.blueprint, session.blueprint),
      };
}
