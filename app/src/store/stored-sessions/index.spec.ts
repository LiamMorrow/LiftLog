import { describe, expect, it } from 'vitest';
import { LocalDate, OffsetDateTime, ZoneOffset, YearMonth } from '@js-joda/core';
import { v4 as uuid } from 'uuid';
import {
  selectSessionsInMonth,
  selectSessionsBy,
  selectSession,
  selectSessions,
  selectPreviousComparableSession,
  selectRecentlyCompletedExercises,
  selectMuscles,
  selectExerciseById,
  getSessionReferenceTime,
  storedSessionsReducer,
  addStoredSession,
  upsertStoredSessions,
  setStoredSessions,
  deleteStoredSession,
  updateExercise,
  deleteExercise,
  setExercises,
} from '@/store/stored-sessions';
import { NoProgressiveOverload, Rest, SessionBlueprint, WeightedExerciseBlueprint } from '@/models/blueprint-models';
import { PotentialSet, RecordedSet, RecordedWeightedExercise, Session } from '@/models/session-models';
import { Weight } from '@/models/weight';
import { ExerciseDescriptor } from '@/models/exercise-models';
import { UnknownAction } from '@reduxjs/toolkit';

function createSessionWithCompletionTime(sessionDate: LocalDate, completionTime: OffsetDateTime, name: string) {
  const blueprint = new SessionBlueprint(
    name,
    [new WeightedExerciseBlueprint(`${name} Exercise`, 1, 5, new NoProgressiveOverload(), Rest.medium, false, '', '')],
    '',
  );
  const exerciseBlueprint = blueprint.exercises[0] as WeightedExerciseBlueprint;
  const recordedExercise = new RecordedWeightedExercise(
    exerciseBlueprint,
    [new PotentialSet(new RecordedSet(exerciseBlueprint.repsPerSet, completionTime), new Weight(100, 'kilograms'))],
    undefined,
  );

  return new Session(uuid(), blueprint, [recordedExercise], sessionDate, undefined, undefined);
}

describe('stored sessions sorting', () => {
  it('sorts sessions in a month by the actual completion time, not only the date', () => {
    const sameDay = LocalDate.of(2026, 4, 10);
    const earlier = createSessionWithCompletionTime(
      sameDay,
      OffsetDateTime.of(2026, 4, 10, 8, 30, 0, 0, ZoneOffset.UTC),
      'Morning',
    );
    const later = createSessionWithCompletionTime(
      sameDay,
      OffsetDateTime.of(2026, 4, 10, 18, 15, 0, 0, ZoneOffset.UTC),
      'Evening',
    );

    const state = {
      storedSessions: {
        sessions: {
          [earlier.id]: earlier,
          [later.id]: later,
        },
      },
    };

    const ordered = selectSessionsInMonth(state, YearMonth.of(2026, 4));

    expect(ordered.map((session) => session.blueprint.name)).toEqual(['Evening', 'Morning']);
  });
});

// ─── Reducer ──────────────────────────────────────────────────────────────────

function reduce(...actions: UnknownAction[]) {
  let state = storedSessionsReducer(undefined, { type: '@@init' });
  for (const action of actions) {
    state = storedSessionsReducer(state, action);
  }
  return state;
}

function exerciseDescriptor(overrides: Partial<ExerciseDescriptor> = {}): ExerciseDescriptor {
  return {
    name: 'Squat',
    force: null,
    level: 'beginner',
    mechanic: null,
    equipment: null,
    muscles: ['quads'],
    instructions: '',
    category: 'strength',
    ...overrides,
  };
}

describe('storedSessions reducer', () => {
  it('addStoredSession stores the session and tracks derived values', () => {
    const session = createSessionWithCompletionTime(
      LocalDate.of(2026, 4, 10),
      OffsetDateTime.of(2026, 4, 10, 10, 0, 0, 0, ZoneOffset.UTC),
      'Squat',
    );

    const state = reduce(addStoredSession(session));

    expect(state.sessions[session.id]).toBe(session);
    expect(state.earliestSession).toBe(session);
    expect(Object.keys(state.latestExercises).length).toBe(1);
  });

  it('upsertStoredSessions adds many and tracks the earliest session', () => {
    const early = createSessionWithCompletionTime(
      LocalDate.of(2026, 1, 1),
      OffsetDateTime.of(2026, 1, 1, 10, 0, 0, 0, ZoneOffset.UTC),
      'A',
    );
    const late = createSessionWithCompletionTime(
      LocalDate.of(2026, 4, 1),
      OffsetDateTime.of(2026, 4, 1, 10, 0, 0, 0, ZoneOffset.UTC),
      'B',
    );

    const state = reduce(upsertStoredSessions([late, early]));

    expect(Object.keys(state.sessions)).toHaveLength(2);
    expect(state.earliestSession).toBe(early);
  });

  it('setStoredSessions replaces sessions and rebuilds latestExercises', () => {
    const first = createSessionWithCompletionTime(
      LocalDate.of(2026, 4, 10),
      OffsetDateTime.of(2026, 4, 10, 10, 0, 0, 0, ZoneOffset.UTC),
      'Squat',
    );
    const replacement = createSessionWithCompletionTime(
      LocalDate.of(2026, 4, 11),
      OffsetDateTime.of(2026, 4, 11, 10, 0, 0, 0, ZoneOffset.UTC),
      'Bench',
    );

    const state = reduce(addStoredSession(first), setStoredSessions({ [replacement.id]: replacement }));

    expect(state.sessions[first.id]).toBeUndefined();
    expect(state.sessions[replacement.id]).toBe(replacement);
  });

  it('deleteStoredSession removes the session and recalculates latest exercises', () => {
    const session = createSessionWithCompletionTime(
      LocalDate.of(2026, 4, 10),
      OffsetDateTime.of(2026, 4, 10, 10, 0, 0, 0, ZoneOffset.UTC),
      'Squat',
    );

    const state = reduce(addStoredSession(session), deleteStoredSession(session.id));

    expect(state.sessions[session.id]).toBeUndefined();
    expect(Object.values(state.latestExercises).filter(Boolean)).toHaveLength(0);
  });

  it('manages saved exercises', () => {
    const squat = exerciseDescriptor({ name: 'Squat', muscles: ['quads'] });
    const bench = exerciseDescriptor({ name: 'Bench', muscles: ['chest'] });

    let state = reduce(updateExercise({ id: '1', exercise: squat }), updateExercise({ id: '2', exercise: bench }));
    expect(state.savedExercises['1']).toBe(squat);

    state = storedSessionsReducer(state, deleteExercise('1'));
    expect(state.savedExercises['1']).toBeUndefined();

    state = storedSessionsReducer(state, setExercises({ '3': squat }));
    expect(Object.keys(state.savedExercises)).toEqual(['3']);
  });
});

// ─── Selectors ────────────────────────────────────────────────────────────────

describe('storedSessions selectors', () => {
  const squat = (date: LocalDate, time: OffsetDateTime, name = 'Squat') =>
    createSessionWithCompletionTime(date, time, name);

  it('selectSessions and selectSession read the session map', () => {
    const session = squat(LocalDate.of(2026, 4, 10), OffsetDateTime.of(2026, 4, 10, 10, 0, 0, 0, ZoneOffset.UTC));
    const state = { storedSessions: reduce(addStoredSession(session)) };

    expect(selectSessions(state)).toHaveLength(1);
    expect(selectSession(state, session.id)).toBe(session);
  });

  it('selectSessionsBy filters to an inclusive date range', () => {
    const inRange = squat(LocalDate.of(2026, 4, 10), OffsetDateTime.of(2026, 4, 10, 10, 0, 0, 0, ZoneOffset.UTC), 'In');
    const tooEarly = squat(
      LocalDate.of(2026, 1, 1),
      OffsetDateTime.of(2026, 1, 1, 10, 0, 0, 0, ZoneOffset.UTC),
      'Early',
    );
    const state = { storedSessions: reduce(upsertStoredSessions([inRange, tooEarly])) };

    const result = selectSessionsBy(state, LocalDate.of(2026, 4, 1), LocalDate.of(2026, 4, 30));

    expect(result.map((s) => s.blueprint.name)).toEqual(['In']);
  });

  it('selectPreviousComparableSession finds the prior session of the same name', () => {
    const older = squat(LocalDate.of(2026, 4, 1), OffsetDateTime.of(2026, 4, 1, 10, 0, 0, 0, ZoneOffset.UTC));
    const newer = squat(LocalDate.of(2026, 4, 8), OffsetDateTime.of(2026, 4, 8, 10, 0, 0, 0, ZoneOffset.UTC));
    const state = { storedSessions: reduce(upsertStoredSessions([older, newer])) };

    expect(selectPreviousComparableSession(state, newer)).toBe(older);
    expect(selectPreviousComparableSession(state, undefined)).toBeUndefined();
  });

  it('selectRecentlyCompletedExercises returns recorded exercises for a blueprint', () => {
    const session = squat(LocalDate.of(2026, 4, 10), OffsetDateTime.of(2026, 4, 10, 10, 0, 0, 0, ZoneOffset.UTC));
    const state = { storedSessions: reduce(addStoredSession(session)) };

    const lookup = selectRecentlyCompletedExercises(state, 5);
    const blueprint = session.recordedExercises[0]!.blueprint as WeightedExerciseBlueprint;

    expect(lookup(blueprint)).toHaveLength(1);
  });

  it('selectMuscles returns sorted distinct muscles and selectExerciseById reads one', () => {
    const state = {
      storedSessions: reduce(
        updateExercise({ id: '1', exercise: exerciseDescriptor({ muscles: ['quads', 'glutes'] }) }),
        updateExercise({ id: '2', exercise: exerciseDescriptor({ muscles: ['glutes', 'chest'] }) }),
      ),
    };

    expect(selectMuscles(state)).toEqual(['chest', 'glutes', 'quads']);
    expect(selectExerciseById(state, '1')!.muscles).toEqual(['quads', 'glutes']);
  });
});

// ─── getSessionReferenceTime ──────────────────────────────────────────────────

describe('getSessionReferenceTime', () => {
  it('uses the last recorded set time when the session is started', () => {
    const time = OffsetDateTime.of(2026, 4, 10, 9, 30, 0, 0, ZoneOffset.UTC);
    const session = createSessionWithCompletionTime(LocalDate.of(2026, 4, 10), time, 'Squat');
    expect(getSessionReferenceTime(session).toEpochSecond()).toBe(time.toEpochSecond());
  });

  it('falls back to the start of the session date when nothing is recorded', () => {
    const blueprint = new SessionBlueprint(
      'Empty',
      [new WeightedExerciseBlueprint('Squat', 1, 5, new NoProgressiveOverload(), Rest.medium, false, '', '')],
      '',
    );
    const exercise = new RecordedWeightedExercise(
      blueprint.exercises[0] as WeightedExerciseBlueprint,
      [new PotentialSet(undefined, new Weight(100, 'kilograms'))],
      undefined,
    );
    const session = new Session(uuid(), blueprint, [exercise], LocalDate.of(2026, 4, 10), undefined, undefined);

    expect(
      getSessionReferenceTime(session)
        .toLocalDate()
        .equals(LocalDate.of(2026, 4, 10)),
    ).toBe(true);
  });
});
