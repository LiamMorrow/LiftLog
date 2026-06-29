import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LocalDate } from '@js-joda/core';
import { configureStore } from '@reduxjs/toolkit';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseAsync } from 'expo-sqlite';
import { DatabaseMigrationService } from '@/services/database-migration-service';
import { applyProgramEffects } from '@/store/program/effects';
import programReducer, {
  initializeProgramStateSlice,
  fetchUpcomingSessions,
  setIsHydrated,
  setSavedPlans,
  setActivePlan,
  savePlan,
  setUpcomingSessions,
  setProgramSessions,
  applyDiffToPlan,
  deleteSavedPlan,
  setSavedPlanName,
  moveSessionBlueprintUpInProgram,
  moveSessionBlueprintDownInProgram,
  removeSessionFromProgram,
  addProgramSession,
  setProgramSession,
} from '@/store/program';
import { createAddEffectTestBed } from '@/utils/__test__/add-effect-testbed';
import { ProgramBlueprint, SessionBlueprint } from '@/models/blueprint-models';
import { RemoteData } from '@/models/remote';
import { EmptySessionBlueprintDiff } from '@/models/blueprint-diff';
import { programsSchema } from '@/db/schema';
import type { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import type { RootState } from '@/store/store';

// ─── Real DB setup ────────────────────────────────────────────────────────────

async function createTestDb(): Promise<ExpoSQLiteDatabase> {
  const expoDb = await openDatabaseAsync(':memory:');
  const db = drizzle(expoDb);
  const migrationService = new DatabaseMigrationService(
    db,
    { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() } as never,
    { importOldData: async () => {} },
  );
  await migrationService.migrate();
  return db;
}

// ─── Redux store setup ────────────────────────────────────────────────────────

function createProgramStore() {
  return configureStore({ reducer: { program: programReducer } });
}

type ProgramStore = ReturnType<typeof createProgramStore>;

function getProgram(store: ProgramStore, id: string) {
  return store.getState().program.savedPrograms[id];
}

// ─── Factories ────────────────────────────────────────────────────────────────

const TODAY = LocalDate.of(2026, 6, 24);

function makeProgram(name = 'Test Plan', sessions: SessionBlueprint[] = []) {
  return new ProgramBlueprint(name, sessions, TODAY);
}

function makeKvStore(overrides?: Record<string, string | null>) {
  const store: Record<string, string | null> = overrides ?? {};
  return {
    getItem: vi.fn().mockImplementation((key: string) => Promise.resolve(store[key] ?? null)),
    setItem: vi.fn().mockImplementation((key: string, val: string) => {
      store[key] = val;
      return Promise.resolve();
    }),
    removeItem: vi.fn().mockImplementation((key: string) => {
      delete store[key];
      return Promise.resolve();
    }),
  };
}

function makeSessionService(sessions: unknown[] = []) {
  return {
    getUpcomingSessions: vi.fn().mockImplementation(function* () {
      yield* sessions;
    }),
  };
}

function makeProgramState(savedPrograms: Record<string, ProgramBlueprint> = {}, activePlanId = '', isHydrated = true) {
  return {
    program: {
      isHydrated,
      activePlanId,
      savedPrograms: Object.fromEntries(Object.entries(savedPrograms).map(([id, p]) => [id, p.toPOJO()])),
      upcomingSessions: RemoteData.notAsked(),
    },
    storedSessions: { latestExercises: {} },
  } as Partial<RootState>;
}

// ─── Effects tests ────────────────────────────────────────────────────────────

describe('program effects', () => {
  describe('initializeProgramStateSlice', () => {
    let db: ExpoSQLiteDatabase;

    beforeEach(async () => {
      db = await createTestDb();
    });

    it('loads programs from DB and dispatches setSavedPlans', async () => {
      const prog = makeProgram('My Plan');
      await db.insert(programsSchema).values({
        id: 'id-1',
        active: true,
        payload: prog.toJSON(),
      });

      const testBed = createAddEffectTestBed({
        services: { db, keyValueStore: makeKvStore({ hasSavedDefaultPlans2: 'true' }) },
      });
      applyProgramEffects(testBed.addEffect);
      testBed.setState(makeProgramState({ 'id-1': prog }, 'id-1'));

      await testBed.dispatchHandled(initializeProgramStateSlice());

      const action = testBed.getDispatchedAction(setSavedPlans);
      expect(action.payload['id-1']).toBeDefined();
    });

    it('creates an empty program when DB is empty', async () => {
      const testBed = createAddEffectTestBed({
        services: { db, keyValueStore: makeKvStore({ hasSavedDefaultPlans2: 'true' }) },
      });
      applyProgramEffects(testBed.addEffect);
      testBed.setState(makeProgramState());

      await testBed.dispatchHandled(initializeProgramStateSlice());

      const action = testBed.getDispatchedAction(setSavedPlans);
      expect(Object.keys(action.payload)).toHaveLength(1);
      const [prog] = Object.values(action.payload);
      expect((prog as ProgramBlueprint).name).toBe('My Plan');
    });

    it('dispatches setActivePlan with the active row id', async () => {
      const prog = makeProgram('Plan A');
      await db.insert(programsSchema).values({
        id: 'active-id',
        active: true,
        payload: prog.toJSON(),
      });

      const testBed = createAddEffectTestBed({
        services: { db, keyValueStore: makeKvStore({ hasSavedDefaultPlans2: 'true' }) },
      });
      applyProgramEffects(testBed.addEffect);
      testBed.setState(makeProgramState({ 'active-id': prog }, 'active-id'));

      await testBed.dispatchHandled(initializeProgramStateSlice());

      const action = testBed.getDispatchedAction(setActivePlan);
      expect(action.payload.activePlanId).toBe('active-id');
    });

    it('falls back to first program if no active flag in DB', async () => {
      const prog = makeProgram('Only Plan');
      await db.insert(programsSchema).values({
        id: 'only-id',
        active: false,
        payload: prog.toJSON(),
      });

      const testBed = createAddEffectTestBed({
        services: { db, keyValueStore: makeKvStore({ hasSavedDefaultPlans2: 'true' }) },
      });
      applyProgramEffects(testBed.addEffect);
      testBed.setState(makeProgramState({ 'only-id': prog }, 'only-id'));

      await testBed.dispatchHandled(initializeProgramStateSlice());

      const action = testBed.getDispatchedAction(setActivePlan);
      expect(action.payload.activePlanId).toBe('only-id');
    });

    it('dispatches setIsHydrated(true) after loading', async () => {
      await db.insert(programsSchema).values({
        id: 'id-1',
        active: true,
        payload: makeProgram().toJSON(),
      });

      const testBed = createAddEffectTestBed({
        services: { db, keyValueStore: makeKvStore({ hasSavedDefaultPlans2: 'true' }) },
      });
      applyProgramEffects(testBed.addEffect);
      testBed.setState(makeProgramState({ 'id-1': makeProgram() }, 'id-1'));

      await testBed.dispatchHandled(initializeProgramStateSlice());

      const action = testBed.getDispatchedAction(setIsHydrated);
      expect(action.payload).toBe(true);
    });

    it('saves built-in programs on first run and sets the storage flag', async () => {
      const kvStore = makeKvStore({});

      const testBed = createAddEffectTestBed({
        services: { db, keyValueStore: kvStore },
      });
      applyProgramEffects(testBed.addEffect);
      testBed.setState(makeProgramState());

      await testBed.dispatchHandled(initializeProgramStateSlice());

      expect(kvStore.setItem).toHaveBeenCalledWith('hasSavedDefaultPlans2', 'true');
      const savePlanActions = testBed.dispatchedActions.filter((a) => a.type === savePlan.type);
      expect(savePlanActions.length).toBeGreaterThan(0);
    });

    it('does not re-save built-in programs when storage flag is already set', async () => {
      const testBed = createAddEffectTestBed({
        services: { db, keyValueStore: makeKvStore({ hasSavedDefaultPlans2: 'true' }) },
      });
      applyProgramEffects(testBed.addEffect);
      testBed.setState(makeProgramState());

      await testBed.dispatchHandled(initializeProgramStateSlice());

      const savePlanActions = testBed.dispatchedActions.filter((a) => a.type === savePlan.type);
      expect(savePlanActions).toHaveLength(0);
    });
  });

  describe('persist effect (undefined trigger)', () => {
    let db: ExpoSQLiteDatabase;

    beforeEach(async () => {
      db = await createTestDb();
    });

    it('persists to DB when savedPrograms changes after hydration', async () => {
      const prog = makeProgram();
      const stateWithProgram = makeProgramState({ 'id-1': prog }, 'id-1', true);

      const testBed = createAddEffectTestBed({
        initialState: stateWithProgram,
        services: { db },
      });
      applyProgramEffects(testBed.addEffect);

      testBed.setStateBeforeReduce({
        program: {
          isHydrated: true,
          activePlanId: 'id-1',
          savedPrograms: {},
          upcomingSessions: RemoteData.notAsked(),
        },
      });

      await testBed.dispatchHandled({ type: 'any/action' });

      const rows = await db.select().from(programsSchema);
      expect(rows).toHaveLength(1);
      expect(rows[0]!.id).toBe('id-1');
    });

    it('does not persist when not yet hydrated', async () => {
      const testBed = createAddEffectTestBed({
        initialState: makeProgramState({}, '', false),
        services: { db },
      });
      applyProgramEffects(testBed.addEffect);

      await testBed.dispatchHandled({ type: 'any/action' });

      const rows = await db.select().from(programsSchema);
      expect(rows).toHaveLength(0);
    });

    it('does not persist when state is unchanged', async () => {
      const prog = makeProgram();
      const state = makeProgramState({ 'id-1': prog }, 'id-1', true);

      const testBed = createAddEffectTestBed({
        initialState: state,
        services: { db },
      });
      applyProgramEffects(testBed.addEffect);
      testBed.setStateBeforeReduce(state);

      await testBed.dispatchHandled({ type: 'any/action' });

      const rows = await db.select().from(programsSchema);
      expect(rows).toHaveLength(0);
    });

    it('marks the active plan correctly when persisting', async () => {
      const prog = makeProgram();
      const state = makeProgramState({ 'id-1': prog, 'id-2': makeProgram('Other') }, 'id-1', true);

      const testBed = createAddEffectTestBed({
        initialState: state,
        services: { db },
      });
      applyProgramEffects(testBed.addEffect);

      testBed.setStateBeforeReduce(makeProgramState({}, 'id-1', true));

      await testBed.dispatchHandled({ type: 'any/action' });

      const rows = await db.select().from(programsSchema);
      const activeRow = rows.find((r) => r.id === 'id-1');
      const inactiveRow = rows.find((r) => r.id === 'id-2');
      expect(activeRow?.active).toBe(true);
      expect(inactiveRow?.active).toBe(false);
    });
  });

  describe('fetchUpcomingSessions', () => {
    it('dispatches setUpcomingSessions with sessions from service', async () => {
      const prog = makeProgram('Plan', []);
      const state = makeProgramState({ 'id-1': prog }, 'id-1');
      const sessionService = makeSessionService([]);

      const testBed = createAddEffectTestBed({
        initialState: state,
        services: { sessionService },
      });
      applyProgramEffects(testBed.addEffect);

      await testBed.dispatchHandled(fetchUpcomingSessions());

      const action = testBed.getDispatchedAction(setUpcomingSessions);
      expect(action.payload.isSuccess()).toBe(true);
    });

    it('takes only as many sessions as there are blueprints', async () => {
      const sessionBlueprint = new SessionBlueprint('Day 1', [], '');
      const prog = makeProgram('Plan', [sessionBlueprint]);
      const mockSessions = [{ id: 's1' }, { id: 's2' }, { id: 's3' }];
      const state = makeProgramState({ 'id-1': prog }, 'id-1');
      const sessionService = makeSessionService(mockSessions);

      const testBed = createAddEffectTestBed({
        initialState: state,
        services: { sessionService },
      });
      applyProgramEffects(testBed.addEffect);

      await testBed.dispatchHandled(fetchUpcomingSessions());

      const action = testBed.getDispatchedAction(setUpcomingSessions);
      const sessions = action.payload.unwrapOr([]);
      expect(sessions).toHaveLength(1);
    });
  });
});

// ─── Reducer tests ────────────────────────────────────────────────────────────

describe('program reducer', () => {
  describe('setIsHydrated', () => {
    it('sets isHydrated to true', () => {
      const store = createProgramStore();
      store.dispatch(setIsHydrated(true));
      expect(store.getState().program.isHydrated).toBe(true);
    });

    it('sets isHydrated to false', () => {
      const store = createProgramStore();
      store.dispatch(setIsHydrated(true));
      store.dispatch(setIsHydrated(false));
      expect(store.getState().program.isHydrated).toBe(false);
    });
  });

  describe('setSavedPlans', () => {
    it('replaces savedPrograms with converted POJO map', () => {
      const store = createProgramStore();
      store.dispatch(setSavedPlans({ 'plan-1': makeProgram('Plan A') }));
      expect(store.getState().program.savedPrograms['plan-1']!.name).toBe('Plan A');
    });
  });

  describe('setActivePlan', () => {
    it('updates activePlanId', () => {
      const store = createProgramStore();
      store.dispatch(setActivePlan({ activePlanId: 'new-id' }));
      expect(store.getState().program.activePlanId).toBe('new-id');
    });
  });

  describe('savePlan', () => {
    it('adds a new plan to savedPrograms', () => {
      const store = createProgramStore();
      store.dispatch(savePlan({ programId: 'save-id', programBlueprint: makeProgram('Saved') }));
      expect(getProgram(store, 'save-id')).toBeDefined();
    });

    it('overwrites an existing plan', () => {
      const store = createProgramStore();
      store.dispatch(savePlan({ programId: 'pid', programBlueprint: makeProgram('First') }));
      store.dispatch(savePlan({ programId: 'pid', programBlueprint: makeProgram('Second') }));
      expect(getProgram(store, 'pid')!.name).toBe('Second');
    });
  });

  describe('deleteSavedPlan', () => {
    it('removes the plan from savedPrograms', () => {
      const store = createProgramStore();
      store.dispatch(savePlan({ programId: 'del-id', programBlueprint: makeProgram() }));
      store.dispatch(deleteSavedPlan({ programId: 'del-id' }));
      expect(getProgram(store, 'del-id')).toBeUndefined();
    });

    it('is a no-op for unknown id', () => {
      const store = createProgramStore();
      const before = store.getState().program.savedPrograms;
      store.dispatch(deleteSavedPlan({ programId: 'ghost' }));
      expect(store.getState().program.savedPrograms).toEqual(before);
    });
  });

  describe('setSavedPlanName', () => {
    it('updates name for existing plan', () => {
      const store = createProgramStore();
      store.dispatch(savePlan({ programId: 'pid', programBlueprint: makeProgram('Old') }));
      store.dispatch(setSavedPlanName({ programId: 'pid', name: 'New' }));
      expect(getProgram(store, 'pid')!.name).toBe('New');
    });

    it('is a no-op for unknown id', () => {
      const store = createProgramStore();
      const before = store.getState().program.savedPrograms;
      store.dispatch(setSavedPlanName({ programId: 'ghost', name: 'X' }));
      expect(store.getState().program.savedPrograms).toEqual(before);
    });
  });

  describe('addProgramSession', () => {
    it('appends a session blueprint to the program', () => {
      const store = createProgramStore();
      store.dispatch(savePlan({ programId: 'pid', programBlueprint: makeProgram() }));
      store.dispatch(
        addProgramSession({
          programId: 'pid',
          sessionBlueprint: new SessionBlueprint('Day 1', [], ''),
        }),
      );
      expect(getProgram(store, 'pid')!.sessions).toHaveLength(1);
    });
  });

  describe('setProgramSession', () => {
    it('replaces a session at a given index', () => {
      const s1 = new SessionBlueprint('Day 1', [], '');
      const s2 = new SessionBlueprint('Day 2', [], '');
      const replacement = new SessionBlueprint('Day 1 Updated', [], '');
      const store = createProgramStore();
      store.dispatch(savePlan({ programId: 'pid', programBlueprint: makeProgram('Plan', [s1, s2]) }));
      store.dispatch(setProgramSession({ programId: 'pid', sessionIndex: 0, sessionBlueprint: replacement }));
      expect(getProgram(store, 'pid')!.sessions[0]!.name).toBe('Day 1 Updated');
    });

    it('is a no-op for out-of-range index', () => {
      const s1 = new SessionBlueprint('Only', [], '');
      const store = createProgramStore();
      store.dispatch(savePlan({ programId: 'pid', programBlueprint: makeProgram('Plan', [s1]) }));
      const before = getProgram(store, 'pid')!.sessions;
      store.dispatch(
        setProgramSession({
          programId: 'pid',
          sessionIndex: 5,
          sessionBlueprint: new SessionBlueprint('New', [], ''),
        }),
      );
      expect(getProgram(store, 'pid')!.sessions).toEqual(before);
    });
  });

  describe('setProgramSessions', () => {
    it('replaces all sessions for a program', () => {
      const store = createProgramStore();
      store.dispatch(
        savePlan({
          programId: 'pid',
          programBlueprint: makeProgram('Plan', [new SessionBlueprint('Old', [], '')]),
        }),
      );
      store.dispatch(
        setProgramSessions({
          programId: 'pid',
          sessionBlueprints: [new SessionBlueprint('A', [], ''), new SessionBlueprint('B', [], '')],
        }),
      );
      expect(getProgram(store, 'pid')!.sessions).toHaveLength(2);
      expect(getProgram(store, 'pid')!.sessions[0]!.name).toBe('A');
    });
  });

  describe('removeSessionFromProgram', () => {
    it('removes the matching session blueprint', () => {
      const s1 = new SessionBlueprint('Keep', [], '');
      const s2 = new SessionBlueprint('Remove', [], '');
      const store = createProgramStore();
      store.dispatch(savePlan({ programId: 'pid', programBlueprint: makeProgram('Plan', [s1, s2]) }));
      store.dispatch(removeSessionFromProgram({ programId: 'pid', sessionBlueprint: s2 }));
      expect(getProgram(store, 'pid')!.sessions).toHaveLength(1);
      expect(getProgram(store, 'pid')!.sessions[0]!.name).toBe('Keep');
    });
  });

  describe('moveSessionBlueprintUpInProgram', () => {
    it('swaps a session with the one before it', () => {
      const s1 = new SessionBlueprint('First', [], '');
      const s2 = new SessionBlueprint('Second', [], '');
      const store = createProgramStore();
      store.dispatch(savePlan({ programId: 'pid', programBlueprint: makeProgram('Plan', [s1, s2]) }));
      store.dispatch(moveSessionBlueprintUpInProgram({ programId: 'pid', sessionBlueprint: s2 }));
      expect(getProgram(store, 'pid')!.sessions[0]!.name).toBe('Second');
      expect(getProgram(store, 'pid')!.sessions[1]!.name).toBe('First');
    });

    it('is a no-op when session is already first', () => {
      const s1 = new SessionBlueprint('First', [], '');
      const s2 = new SessionBlueprint('Second', [], '');
      const store = createProgramStore();
      store.dispatch(savePlan({ programId: 'pid', programBlueprint: makeProgram('Plan', [s1, s2]) }));
      store.dispatch(moveSessionBlueprintUpInProgram({ programId: 'pid', sessionBlueprint: s1 }));
      expect(getProgram(store, 'pid')!.sessions[0]!.name).toBe('First');
    });
  });

  describe('moveSessionBlueprintDownInProgram', () => {
    it('swaps a session with the one after it', () => {
      const s1 = new SessionBlueprint('First', [], '');
      const s2 = new SessionBlueprint('Second', [], '');
      const store = createProgramStore();
      store.dispatch(savePlan({ programId: 'pid', programBlueprint: makeProgram('Plan', [s1, s2]) }));
      store.dispatch(moveSessionBlueprintDownInProgram({ programId: 'pid', sessionBlueprint: s1 }));
      expect(getProgram(store, 'pid')!.sessions[0]!.name).toBe('Second');
      expect(getProgram(store, 'pid')!.sessions[1]!.name).toBe('First');
    });

    it('is a no-op when session is already last', () => {
      const s1 = new SessionBlueprint('First', [], '');
      const s2 = new SessionBlueprint('Second', [], '');
      const store = createProgramStore();
      store.dispatch(savePlan({ programId: 'pid', programBlueprint: makeProgram('Plan', [s1, s2]) }));
      store.dispatch(moveSessionBlueprintDownInProgram({ programId: 'pid', sessionBlueprint: s2 }));
      expect(getProgram(store, 'pid')!.sessions[1]!.name).toBe('Second');
    });
  });

  describe('applyDiffToPlan', () => {
    it('adds a session on "add" diff type', () => {
      const activeId = 'active-id';
      const store = createProgramStore();
      store.dispatch(savePlan({ programId: activeId, programBlueprint: makeProgram('Plan', []) }));
      store.dispatch(setActivePlan({ activePlanId: activeId }));
      store.dispatch(
        applyDiffToPlan({
          type: 'add',
          diff: EmptySessionBlueprintDiff,
        }),
      );
      expect(getProgram(store, activeId)!.sessions).toHaveLength(1);
    });
  });

  describe('setUpcomingSessions', () => {
    it('stores the upcoming sessions remote data', () => {
      const store = createProgramStore();
      const sessions = RemoteData.success([]);
      store.dispatch(setUpcomingSessions(sessions));
      expect(store.getState().program.upcomingSessions).toEqual(sessions);
    });
  });
});
