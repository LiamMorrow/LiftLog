import { describe, expect, it } from 'vitest';
import { LocalDate } from '@js-joda/core';
import { configureStore } from '@reduxjs/toolkit';
import { ProgramBlueprint, SessionBlueprint } from '@/models/blueprint-models';
import { makeWeightedBlueprint } from '@/models/session-models/__test__/helpers';
import programReducer, {
  savePlan,
  selectProgramSession,
  selectProgramSessionExercise,
  updateProgram,
} from '@/store/program';

const PLAN_A = 'plan-a';
const PLAN_B = 'plan-b';

function makeStore() {
  const store = configureStore({
    reducer: { program: programReducer },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false, immutableCheck: false }),
  });
  const plan = (name: string) =>
    new ProgramBlueprint(
      name,
      ['Workout A', 'Workout B'].map(
        (sessionName) =>
          new SessionBlueprint(
            sessionName,
            [makeWeightedBlueprint({ name: 'Squat' }), makeWeightedBlueprint({ name: 'Bench' })],
            '',
          ),
      ),
      LocalDate.of(2026, 8, 6),
    );
  store.dispatch(savePlan({ programId: PLAN_A, programBlueprint: plan('Plan A') }));
  store.dispatch(savePlan({ programId: PLAN_B, programBlueprint: plan('Plan B') }));
  return store;
}

type Store = ReturnType<typeof makeStore>;

function sessionNames(store: Store, programId: string) {
  return store.getState().program.savedPrograms[programId]!.sessions.map((s) => s.name);
}

describe('updateProgram', () => {
  // Two workout editor screens can be open at once, one per navigation stack, and both edit the plan
  // directly. Nothing either dispatches may reach a plan or workout other than the one it names.
  it('applies the edit to the plan it names', () => {
    const store = makeStore();

    store.dispatch(
      updateProgram({
        programId: PLAN_A,
        update: (program) => program.withSession(1, (session) => session.withName('Leg Day')),
      }),
    );

    expect(sessionNames(store, PLAN_A)).toEqual(['Workout A', 'Leg Day']);
    expect(sessionNames(store, PLAN_B)).toEqual(['Workout A', 'Workout B']);
  });

  it('leaves the other plan alone when a workout is added', () => {
    const store = makeStore();

    store.dispatch(
      updateProgram({
        programId: PLAN_B,
        update: (program) => program.withAddedSession(new SessionBlueprint('Workout C', [], '')),
      }),
    );

    expect(sessionNames(store, PLAN_B)).toEqual(['Workout A', 'Workout B', 'Workout C']);
    expect(sessionNames(store, PLAN_A)).toEqual(['Workout A', 'Workout B']);
  });

  it('ignores an edit to a plan that no longer exists', () => {
    const store = makeStore();

    store.dispatch(
      updateProgram({
        programId: 'deleted-plan',
        update: (program) => program.withName('Nowhere'),
      }),
    );

    expect(Object.keys(store.getState().program.savedPrograms)).toEqual([PLAN_A, PLAN_B]);
    expect(sessionNames(store, PLAN_A)).toEqual(['Workout A', 'Workout B']);
  });

  it('replaces the plan rather than mutating it, so subscribers see the change', () => {
    const store = makeStore();
    const before = store.getState().program.savedPrograms[PLAN_A]!;

    store.dispatch(
      updateProgram({
        programId: PLAN_A,
        update: (program) => program.withSession(0, (session) => session.withNotes('heavy')),
      }),
    );

    expect(store.getState().program.savedPrograms[PLAN_A]).not.toBe(before);
    expect(before.sessions[0]!.notes).toBe('');
  });
});

describe('selectProgramSession', () => {
  it('reads the workout at the given index of the given plan', () => {
    const store = makeStore();
    store.dispatch(
      updateProgram({
        programId: PLAN_B,
        update: (program) => program.withSession(0, (session) => session.withName('Leg Day')),
      }),
    );

    expect(selectProgramSession(store.getState(), { programId: PLAN_B, sessionIndex: 0 })?.name).toBe('Leg Day');
    expect(selectProgramSession(store.getState(), { programId: PLAN_A, sessionIndex: 0 })?.name).toBe('Workout A');
  });

  it('is undefined for a workout or plan that does not exist', () => {
    const store = makeStore();

    expect(selectProgramSession(store.getState(), { programId: PLAN_A, sessionIndex: 9 })).toBeUndefined();
    expect(selectProgramSession(store.getState(), { programId: 'nope', sessionIndex: 0 })).toBeUndefined();
  });

  it('reads a single exercise, and is undefined past the end', () => {
    const store = makeStore();
    const location = { programId: PLAN_A, sessionIndex: 1 };

    expect(selectProgramSessionExercise(store.getState(), { ...location, exerciseIndex: 1 })?.name).toBe('Bench');
    expect(selectProgramSessionExercise(store.getState(), { ...location, exerciseIndex: 2 })).toBeUndefined();
  });
});
