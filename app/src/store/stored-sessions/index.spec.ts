import { describe, expect, it } from 'vitest';
import { LocalDate, OffsetDateTime, ZoneOffset } from '@js-joda/core';
import { v4 as uuid } from 'uuid';
import {
  selectSession,
  selectMuscles,
  selectExerciseById,
  selectExercises,
  getSessionReferenceTime,
  storedSessionsReducer,
  putStoredSession,
  updateStoredSession,
  setActiveSessionId,
  upsertStoredSessions,
  openSession,
  closeSession,
  deleteStoredSession,
  updateExercise,
  upsertExercises,
  deleteExercise,
  restoreExercise,
  setExercises,
  setBuiltInExercises,
  setHiddenBuiltInIds,
} from '@/store/stored-sessions';
import { SessionBlueprint, WeightedExerciseBlueprint } from '@/models/blueprint-models';
import { RecordedWeightedExercise, Session } from '@/models/session-models';
import { Weight } from '@/models/weight';
import { ExerciseDescriptor } from '@/models/exercise-models';
import { UnknownAction } from '@reduxjs/toolkit';
import { emptyPotentialSet, filledPotentialSet, makeWeightedBlueprint } from '@/models/session-models/__test__/helpers';

function createSessionWithCompletionTime(sessionDate: LocalDate, completionTime: OffsetDateTime, name: string) {
  const blueprint = new SessionBlueprint(
    name,
    [
      makeWeightedBlueprint({
        name: `${name} Exercise`,
        sets: 1,
        repsConfig: { type: 'fixed', reps: 5 },
        progression: [],
      }),
    ],
    '',
  );
  const exerciseBlueprint = blueprint.exercises[0] as WeightedExerciseBlueprint;
  const recordedExercise = new RecordedWeightedExercise(
    exerciseBlueprint,
    [filledPotentialSet(exerciseBlueprint.repsTargetForSet(0).max, completionTime, new Weight(100, 'kilograms'))],
    undefined,
  );

  return new Session(uuid(), blueprint, [recordedExercise], sessionDate, undefined, undefined);
}

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
  it('putStoredSession opens the session', () => {
    const session = createSessionWithCompletionTime(
      LocalDate.of(2026, 4, 10),
      OffsetDateTime.of(2026, 4, 10, 10, 0, 0, 0, ZoneOffset.UTC),
      'Squat',
    );

    const state = reduce(putStoredSession(session));

    expect(state.openSessions[session.id]).toBe(session);
  });

  it('upsertStoredSessions refreshes an open session but opens none', () => {
    const open = createSessionWithCompletionTime(
      LocalDate.of(2026, 1, 1),
      OffsetDateTime.of(2026, 1, 1, 10, 0, 0, 0, ZoneOffset.UTC),
      'A',
    );
    const closed = createSessionWithCompletionTime(
      LocalDate.of(2026, 4, 1),
      OffsetDateTime.of(2026, 4, 1, 10, 0, 0, 0, ZoneOffset.UTC),
      'B',
    );
    const restored = open.withUpdatedDate(LocalDate.of(2026, 1, 2));

    const state = reduce(openSession(open), upsertStoredSessions([restored, closed]));

    expect(state.openSessions[open.id]).toBe(restored);
    expect(state.openSessions[closed.id]).toBeUndefined();
  });

  it('closeSession drops a past session but keeps the workout in progress open', () => {
    const past = createSessionWithCompletionTime(
      LocalDate.of(2026, 4, 1),
      OffsetDateTime.of(2026, 4, 1, 10, 0, 0, 0, ZoneOffset.UTC),
      'Past',
    );
    const active = createSessionWithCompletionTime(
      LocalDate.of(2026, 4, 10),
      OffsetDateTime.of(2026, 4, 10, 10, 0, 0, 0, ZoneOffset.UTC),
      'Active',
    );

    const state = reduce(
      openSession(past),
      openSession(active),
      setActiveSessionId(active.id),
      closeSession(past.id),
      closeSession(active.id),
    );

    expect(state.openSessions[past.id]).toBeUndefined();
    expect(state.openSessions[active.id]).toBe(active);
  });

  it('updateStoredSession edits the addressed session and leaves the others alone', () => {
    const target = createSessionWithCompletionTime(
      LocalDate.of(2026, 4, 10),
      OffsetDateTime.of(2026, 4, 10, 10, 0, 0, 0, ZoneOffset.UTC),
      'Squat',
    );
    const bystander = createSessionWithCompletionTime(
      LocalDate.of(2026, 4, 11),
      OffsetDateTime.of(2026, 4, 11, 10, 0, 0, 0, ZoneOffset.UTC),
      'Bench',
    );

    const state = reduce(
      putStoredSession(target),
      putStoredSession(bystander),
      updateStoredSession({ sessionId: target.id, update: (s) => s.withUpdatedDate(LocalDate.of(2026, 5, 1)) }),
    );

    expect(state.openSessions[target.id]!.date.toString()).toBe('2026-05-01');
    expect(state.openSessions[bystander.id]).toBe(bystander);
  });

  it('updateStoredSession is a no-op for a session that is not open', () => {
    const state = reduce(updateStoredSession({ sessionId: 'missing', update: (s) => s }));

    expect(state.openSessions).toEqual({});
  });

  it('setActiveSessionId moves the pointer without touching what is stored', () => {
    const session = createSessionWithCompletionTime(
      LocalDate.of(2026, 4, 10),
      OffsetDateTime.of(2026, 4, 10, 10, 0, 0, 0, ZoneOffset.UTC),
      'Squat',
    );

    const state = reduce(putStoredSession(session), setActiveSessionId(session.id));

    expect(state.activeSessionId).toBe(session.id);
    expect(state.openSessions[session.id]).toBe(session);
  });

  it('deleting the active session clears the pointer at it', () => {
    const session = createSessionWithCompletionTime(
      LocalDate.of(2026, 4, 10),
      OffsetDateTime.of(2026, 4, 10, 10, 0, 0, 0, ZoneOffset.UTC),
      'Squat',
    );

    const state = reduce(putStoredSession(session), setActiveSessionId(session.id), deleteStoredSession(session.id));

    expect(state.activeSessionId).toBeUndefined();
  });

  it('deleteStoredSession removes the session', () => {
    const session = createSessionWithCompletionTime(
      LocalDate.of(2026, 4, 10),
      OffsetDateTime.of(2026, 4, 10, 10, 0, 0, 0, ZoneOffset.UTC),
      'Squat',
    );

    const state = reduce(putStoredSession(session), deleteStoredSession(session.id));

    expect(state.openSessions[session.id]).toBeUndefined();
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

  it('upserts restored exercises without replacing existing ones', () => {
    const existing = exerciseDescriptor({ name: 'Existing' });
    const restored = exerciseDescriptor({ name: 'Restored' });

    const state = reduce(updateExercise({ id: 'existing', exercise: existing }), upsertExercises({ restored }));

    expect(state.savedExercises).toEqual({ existing, restored });
  });

  it('merges built-in and saved exercises, with saved overriding by id and sorted by name', () => {
    const state = reduce(
      setBuiltInExercises({
        Squat: exerciseDescriptor({ name: 'Squat' }),
        Bench: exerciseDescriptor({ name: 'Bench' }),
      }),
      updateExercise({ id: 'Squat', exercise: exerciseDescriptor({ name: 'Back Squat' }) }),
      updateExercise({ id: 'uuid-1', exercise: exerciseDescriptor({ name: 'Deadlift' }) }),
    );

    const merged = selectExercises({ storedSessions: state });
    expect(Object.values(merged).map((e) => e.name)).toEqual(['Back Squat', 'Bench', 'Deadlift']);
    expect(merged['Squat']!.name).toBe('Back Squat');
  });

  it('deleting a built-in tombstones it, and restore brings it back', () => {
    let state = reduce(setBuiltInExercises({ Squat: exerciseDescriptor({ name: 'Squat' }) }));

    state = storedSessionsReducer(state, deleteExercise('Squat'));
    expect(state.hiddenBuiltInIds).toEqual(['Squat']);
    expect(selectExercises({ storedSessions: state })['Squat']).toBeUndefined();

    state = storedSessionsReducer(state, restoreExercise('Squat'));
    expect(state.hiddenBuiltInIds).toEqual([]);
    expect(selectExercises({ storedSessions: state })['Squat']).toBeDefined();
  });

  it('editing a hidden built-in un-hides it', () => {
    let state = reduce(
      setBuiltInExercises({ Squat: exerciseDescriptor({ name: 'Squat' }) }),
      setHiddenBuiltInIds(['Squat']),
    );

    state = storedSessionsReducer(
      state,
      updateExercise({ id: 'Squat', exercise: exerciseDescriptor({ name: 'Squat v2' }) }),
    );
    expect(state.hiddenBuiltInIds).toEqual([]);
    expect(selectExercises({ storedSessions: state })['Squat']!.name).toBe('Squat v2');
  });
});

// ─── Selectors ────────────────────────────────────────────────────────────────

describe('storedSessions selectors', () => {
  const squat = (date: LocalDate, time: OffsetDateTime, name = 'Squat') =>
    createSessionWithCompletionTime(date, time, name);

  it('selectSession finds an open session', () => {
    const session = squat(LocalDate.of(2026, 4, 10), OffsetDateTime.of(2026, 4, 10, 10, 0, 0, 0, ZoneOffset.UTC));
    const state = { storedSessions: reduce(openSession(session)) };

    expect(selectSession(state, session.id)).toBe(session);
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
      [
        makeWeightedBlueprint({
          name: 'Squat',
          sets: 1,
          repsConfig: { type: 'fixed', reps: 5 },
          progression: [],
        }),
      ],
      '',
    );
    const exercise = new RecordedWeightedExercise(
      blueprint.exercises[0] as WeightedExerciseBlueprint,
      [emptyPotentialSet(100)],
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
