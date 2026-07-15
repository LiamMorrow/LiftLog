import { describe, it, expect } from 'vitest';
import Enumerable from 'linq';
import { SessionService } from '@/services/session-service';
import { ProgressRepository } from '@/services/progress-repository';
import { SessionBlueprint } from '@/models/blueprint-models';
import { Session } from '@/models/session-models';
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
