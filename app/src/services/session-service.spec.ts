import { describe, it, expect } from 'vitest';
import Enumerable from 'linq';
import { SessionService } from '@/services/session-service';
import { ProgressRepository } from '@/services/progress-repository';
import { ProgressionRule, SessionBlueprint, WeightedExerciseBlueprint } from '@/models/blueprint-models';
import BigNumber from 'bignumber.js';
import { RecordedWeightedExercise, Session } from '@/models/session-models';
import { makeRecordedExercise, makeWeightedBlueprint } from '@/models/session-models/__test__/helpers';
import { Weight } from '@/models/weight';
import type { RootState } from '@/store';

function makeState(overrides?: { workoutSession?: Session; orderedSessions?: Session[] }): RootState {
  return {
    settings: { useImperialUnits: false },
    currentSession: { workoutSession: overrides?.workoutSession },
  } as unknown as RootState;
}

function makeService(state: RootState, orderedSessions: Session[] = []) {
  const progressRepository = {
    getOrderedSessions: () => Enumerable.from(orderedSessions),
  } as unknown as ProgressRepository;
  return new SessionService(progressRepository, () => state);
}

async function collect(iter: AsyncIterableIterator<Session>, count: number): Promise<Session[]> {
  const out: Session[] = [];
  for await (const session of iter) {
    out.push(session);
    if (out.length >= count) break;
  }
  return out;
}

function bp(name: string, notes = '') {
  return new SessionBlueprint(name, [], notes);
}

describe('SessionService.getUpcomingSessions', () => {
  it('walks the plan in order and cycles when there is no history', async () => {
    const plan = [bp('Push'), bp('Pull'), bp('Legs')];
    const service = makeService(makeState());

    const upcoming = await collect(service.getUpcomingSessions(plan, {}), 6);

    expect(upcoming.map((s) => s.blueprint.name)).toEqual(['Push', 'Pull', 'Legs', 'Push', 'Pull', 'Legs']);
  });

  it('advances past duplicate-named workouts instead of stalling', async () => {
    // Regression: matching the next workout by name resolved duplicates to the
    // first occurrence, trapping progression on it forever.
    const plan = [bp('Upper'), bp('Lower'), bp('Lower', 'second'), bp('Cardio')];
    const service = makeService(makeState());

    const upcoming = await collect(service.getUpcomingSessions(plan, {}), 8);

    expect(upcoming.map((s) => s.blueprint.name)).toEqual([
      'Upper',
      'Lower',
      'Lower',
      'Cardio',
      'Upper',
      'Lower',
      'Lower',
      'Cardio',
    ]);
    // The second "Lower" must be the distinct blueprint, not a repeat of the first.
    expect(upcoming[2]!.blueprint.notes).toBe('second');
  });

  it('continues from the last completed session', async () => {
    const plan = [bp('Push'), bp('Pull'), bp('Legs')];
    const service = makeService(makeState());
    const completed = service.hydrateSessionFromBlueprint(bp('Pull'), {});

    const upcoming = await collect(makeService(makeState(), [completed]).getUpcomingSessions(plan, {}), 3);

    expect(upcoming.map((s) => s.blueprint.name)).toEqual(['Legs', 'Push', 'Pull']);
  });

  it('restarts the plan when the last session is no longer in the plan', async () => {
    const plan = [bp('Push'), bp('Pull')];
    const stale = makeService(makeState()).hydrateSessionFromBlueprint(bp('Removed'), {});

    const upcoming = await collect(makeService(makeState(), [stale]).getUpcomingSessions(plan, {}), 3);

    expect(upcoming.map((s) => s.blueprint.name)).toEqual(['Push', 'Pull', 'Push']);
  });

  it('repeats a single-workout plan', async () => {
    const plan = [bp('Full Body')];
    const upcoming = await collect(makeService(makeState()).getUpcomingSessions(plan, {}), 3);

    expect(upcoming.map((s) => s.blueprint.name)).toEqual(['Full Body', 'Full Body', 'Full Body']);
  });

  it('yields nothing for an empty plan', async () => {
    const upcoming = await collect(makeService(makeState()).getUpcomingSessions([], {}), 3);
    expect(upcoming).toHaveLength(0);
  });

  it('gives every upcoming session a unique id', async () => {
    const plan = [bp('A'), bp('B')];
    const upcoming = await collect(makeService(makeState()).getUpcomingSessions(plan, {}), 6);
    expect(new Set(upcoming.map((s) => s.id)).size).toBe(upcoming.length);
  });
});

describe('SessionService rep targets', () => {
  async function upcoming(blueprint: WeightedExerciseBlueprint, latest?: RecordedWeightedExercise) {
    const service = makeService(makeState());
    const [session] = await collect(
      service.getUpcomingSessions(
        [new SessionBlueprint('Day', [blueprint], '')],
        latest ? { [blueprint.progressionKey()]: latest } : {},
      ),
      1,
    );
    return session!.recordedExercises[0] as RecordedWeightedExercise;
  }

  it('seeds targets from the blueprint when the exercise has no history', async () => {
    const blueprint = makeWeightedBlueprint({ sets: 2, repsConfig: { type: 'range', min: 8, max: 12 } });

    expect((await upcoming(blueprint)).potentialSets.map((s) => s.target)).toEqual([
      { min: 8, max: 12 },
      { min: 8, max: 12 },
    ]);
  });

  it('carries last session’s targets forward alongside its weights', async () => {
    const blueprint = makeWeightedBlueprint({ sets: 2, loadBasis: 'none' });
    const lastWeek = makeRecordedExercise(blueprint, [10, 10]).withAllSets((s) =>
      s.with({ target: { min: 15, max: 15 } }),
    );

    expect((await upcoming(blueprint, lastWeek)).potentialSets.map((s) => s.target)).toEqual([
      { min: 15, max: 15 },
      { min: 15, max: 15 },
    ]);
  });

  it('does not progress the load of an exercise that tracks none', async () => {
    const blueprint = makeWeightedBlueprint({ sets: 2, loadBasis: 'none' });
    const lastWeek = makeRecordedExercise(blueprint, [10, 10], new Weight(60, 'kilograms'));

    const weights = (await upcoming(blueprint, lastWeek)).potentialSets.map((s) => s.weight.value.toNumber());

    expect(lastWeek.isSuccessForProgressiveOverload).toBe(true);
    expect(weights).toEqual([60, 60]);
  });

  it('starts the new session with nothing recorded', async () => {
    const blueprint = makeWeightedBlueprint({ sets: 2 });
    const lastWeek = makeRecordedExercise(blueprint, [10, 10]);

    expect((await upcoming(blueprint, lastWeek)).potentialSets.every((s) => s.set === undefined)).toBe(true);
  });

  it('carries a target a reps rule won, even on an exercise that also carries load', async () => {
    const blueprint = makeWeightedBlueprint({
      sets: 2,
      repsConfig: { type: 'fixed', reps: 8 },
      progression: [
        ProgressionRule.of({ axis: 'reps', step: new BigNumber(1), ceiling: new BigNumber(12) }),
        ProgressionRule.load(new BigNumber(2.5)),
      ],
    });
    const lastWeek = makeRecordedExercise(blueprint, [10, 10]).withAllSets((s) =>
      s.with({ target: { min: 10, max: 10 } }),
    );

    // Climbed to 10 by the rule, so the next session starts from 10 and the rule takes it to 11.
    expect((await upcoming(blueprint, lastWeek)).potentialSets.map((s) => s.target)).toEqual([
      { min: 11, max: 11 },
      { min: 11, max: 11 },
    ]);
  });

  it('re-seeds the target from the plan when reps are a fixed prescription', async () => {
    // Nothing but an edit to the plan could have moved this target, and that edit already had its
    // own say in the save-changes dialog - carrying it would be a second, silent yes.
    const blueprint = makeWeightedBlueprint({ sets: 2, repsConfig: { type: 'fixed', reps: 5 } });
    const lastWeek = makeRecordedExercise(blueprint, [10, 10]).withAllSets((s) =>
      s.with({ target: { min: 8, max: 8 } }),
    );

    expect((await upcoming(blueprint, lastWeek)).potentialSets.map((s) => s.target)).toEqual([
      { min: 5, max: 5 },
      { min: 5, max: 5 },
    ]);
  });

  it('gives every set the edited target once the plan agrees, including one logged before the edit', async () => {
    // Editing reps mid-exercise leaves already-logged sets chasing the old target, by design. Once
    // the edit is saved to the plan the next session must not still be carrying that stale first set.
    const edited = makeWeightedBlueprint({ sets: 3, repsConfig: { type: 'fixed', reps: 8 } });
    const lastWeek = makeRecordedExercise(edited, [10, 10, 10]).with({
      potentialSets: [
        { min: 5, max: 5 },
        { min: 8, max: 8 },
        { min: 8, max: 8 },
      ].map((target, index) => makeRecordedExercise(edited, [10, 10, 10]).potentialSets[index]!.with({ target })),
    });

    expect((await upcoming(edited, lastWeek)).potentialSets.map((s) => s.target)).toEqual([
      { min: 8, max: 8 },
      { min: 8, max: 8 },
      { min: 8, max: 8 },
    ]);
  });

  it('falls back to the last planned set when the previous session ran longer than the plan', async () => {
    const blueprint = makeWeightedBlueprint({
      sets: 2,
      repsConfig: {
        type: 'perSet',
        targets: [
          { min: 12, max: 12 },
          { min: 10, max: 10 },
        ],
      },
    });
    const lastWeek = makeRecordedExercise(blueprint, [12, 10, 10]);

    expect((await upcoming(blueprint, lastWeek)).potentialSets.map((s) => s.target)).toEqual([
      { min: 12, max: 12 },
      { min: 10, max: 10 },
      { min: 10, max: 10 },
    ]);
  });
});

describe('SessionService progressive overload', () => {
  async function upcomingWeights(blueprint: WeightedExerciseBlueprint, latest?: RecordedWeightedExercise) {
    const service = makeService(makeState());
    const [session] = await collect(
      service.getUpcomingSessions(
        [new SessionBlueprint('Day', [blueprint], '')],
        latest ? { [blueprint.progressionKey()]: latest } : {},
      ),
      1,
    );
    const exercise = session!.recordedExercises[0] as RecordedWeightedExercise;
    return exercise.potentialSets.map((s) => s.weight.value.toNumber());
  }

  it('raises the load after a session that hit every target', async () => {
    const blueprint = makeWeightedBlueprint({ sets: 2 });
    const lastWeek = makeRecordedExercise(blueprint, [10, 10], new Weight(60, 'kilograms'));

    expect(lastWeek.isSuccessForProgressiveOverload).toBe(true);
    expect(await upcomingWeights(blueprint, lastWeek)).toEqual([62.5, 62.5]);
  });

  it('holds the load after a session that missed a target', async () => {
    const blueprint = makeWeightedBlueprint({ sets: 2 });
    const lastWeek = makeRecordedExercise(blueprint, [10, 9], new Weight(60, 'kilograms'));

    expect(lastWeek.isSuccessForProgressiveOverload).toBe(false);
    expect(await upcomingWeights(blueprint, lastWeek)).toEqual([60, 60]);
  });

  it('holds the load when a set was never filled out', async () => {
    const blueprint = makeWeightedBlueprint({ sets: 2 });
    const lastWeek = makeRecordedExercise(blueprint, [10, undefined], new Weight(60, 'kilograms'));

    expect(await upcomingWeights(blueprint, lastWeek)).toEqual([60, 60]);
  });

  it('starts a fresh exercise at zero rather than progressing from nothing', async () => {
    const blueprint = makeWeightedBlueprint({ sets: 2 });

    expect(await upcomingWeights(blueprint)).toEqual([0, 0]);
  });

  it('progresses a bodyweight exercise, which carries load on top of the lifter', async () => {
    const blueprint = makeWeightedBlueprint({ sets: 2, loadBasis: 'bodyweight' });
    const lastWeek = makeRecordedExercise(blueprint, [10, 10], new Weight(10, 'kilograms'));

    expect(await upcomingWeights(blueprint, lastWeek)).toEqual([12.5, 12.5]);
  });

  it('leaves the load alone when the plan asks for no progression', async () => {
    const blueprint = makeWeightedBlueprint({ sets: 2, progression: [] });
    const lastWeek = makeRecordedExercise(blueprint, [10, 10], new Weight(60, 'kilograms'));

    expect(await upcomingWeights(blueprint, lastWeek)).toEqual([60, 60]);
  });
});
