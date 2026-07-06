import { describe, it, expect, vi } from 'vitest';
import { OffsetDateTime, ZoneOffset } from '@js-joda/core';
import {
  initializeCurrentSessionStateSlice,
  setCurrentSession,
  setIsHydrated,
  currentWorkoutSessionUpdated,
  finishCurrentWorkout,
  persistCurrentSession,
  clearSetTimerNotification,
  notifySetTimer,
  broadcastWorkoutEvent,
  setCurrentSessionFromBlueprint,
} from '@/store/current-session';
import { RootState } from '@/store/store';
import { applyCurrentSessionEffects } from '@/store/current-session/effects';
import { createAddEffectTestBed } from '@/utils/__test__/add-effect-testbed';
import { EmptySession, Session } from '@/models/session-models';
import { addUnpublishedSessionId } from '@/store/feed';
import { setStatsIsDirty } from '@/store/stats';
import { addStoredSession } from '@/store/stored-sessions';
import { fetchUpcomingSessions } from '@/store/program';
import { setRestTimersEnabled } from '@/store/settings';
import { WorkoutUpdatedEvent } from '@/models/workout-worker-messages';
import { SessionBlueprint } from '@/models/blueprint-models';
import { RecordedWeightedExercise, PotentialSet } from '@/models/session-models/recorded-weighted-exercise';
import { Weight } from '@/models/weight';
import { makeWeightedBlueprint, filledPotentialSet } from '@/models/session-models/__test__/helpers';
import { uuid } from '@/utils/uuid';

function broadcastEventTypes(testBed: ReturnType<typeof createAddEffectTestBed>): string[] {
  return testBed.dispatchedActions
    .filter((a) => a.type === broadcastWorkoutEvent.type)
    .map((a) => (a as unknown as { payload: { type: string } }).payload.type);
}

function sessionWithRestTimer(restTimerStartTime: OffsetDateTime): Session {
  const bp = makeWeightedBlueprint();
  const exercise = new RecordedWeightedExercise(
    bp,
    [filledPotentialSet(10, restTimerStartTime), new PotentialSet(undefined, new Weight(100, 'kilograms'))],
    undefined,
  );
  return new Session(
    uuid(),
    new SessionBlueprint('Test', [bp], ''),
    [exercise],
    EmptySession.date,
    undefined,
    restTimerStartTime,
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeKeyValueStore(overrides?: Partial<ReturnType<typeof defaultKvStore>>) {
  return { ...defaultKvStore(), ...overrides };
}

function defaultKvStore() {
  return {
    getItem: vi.fn().mockResolvedValue(null),
    getItemBytes: vi.fn().mockResolvedValue(null),
    setItem: vi.fn().mockResolvedValue(undefined),
    removeItem: vi.fn().mockResolvedValue(undefined),
  };
}

const hydratedSettingsState = {
  settings: { isHydrated: true },
} as Partial<RootState>;

describe('current-session effects', () => {
  // ─── initializeCurrentSessionStateSlice ──────────────────────────────────────

  describe('applyCurrentSessionEffects — initializeCurrentSessionStateSlice', () => {
    it('dispatches setIsHydrated(true) when there is no stored session', async () => {
      const testBed = createAddEffectTestBed({
        initialState: hydratedSettingsState,
        services: { keyValueStore: makeKeyValueStore() },
      });
      applyCurrentSessionEffects(testBed.addEffect);

      await testBed.dispatchHandled(initializeCurrentSessionStateSlice());

      const action = testBed.getDispatchedAction(setIsHydrated);
      expect(action.payload).toBe(true);
    });

    it('throws and logs if settings are not yet hydrated', async () => {
      const testBed = createAddEffectTestBed({
        initialState: { settings: { isHydrated: false } },
        services: { keyValueStore: makeKeyValueStore() },
      });
      applyCurrentSessionEffects(testBed.addEffect);

      await testBed.dispatchHandled(initializeCurrentSessionStateSlice());

      testBed.expectNotDispatched(setIsHydrated);
    });

    it('dispatches setIsHydrated(true) when version key is missing (defaults to v2 path with empty bytes)', async () => {
      const kvStore = makeKeyValueStore({
        getItem: vi.fn().mockImplementation((key: string) => {
          if (key === 'CurrentSessionStateV1-Version') return Promise.resolve(null);
          return Promise.resolve(null);
        }),
        getItemBytes: vi.fn().mockResolvedValue(new Uint8Array()),
      });
      const testBed = createAddEffectTestBed({
        initialState: hydratedSettingsState,
        services: { keyValueStore: kvStore },
      });
      applyCurrentSessionEffects(testBed.addEffect);

      await testBed.dispatchHandled(initializeCurrentSessionStateSlice());

      const action = testBed.getDispatchedAction(setIsHydrated);
      expect(action.payload).toBe(true);
    });

    it('dispatches setIsHydrated(true) on v3 path with null stored value', async () => {
      const kvStore = makeKeyValueStore({
        getItem: vi.fn().mockImplementation((key: string) => {
          if (key === 'CurrentSessionStateV1-Version') return Promise.resolve('3');
          if (key === 'CurrentSessionStateV1') return Promise.resolve(null);
          return Promise.resolve(null);
        }),
      });
      const testBed = createAddEffectTestBed({
        initialState: hydratedSettingsState,
        services: { keyValueStore: kvStore },
      });
      applyCurrentSessionEffects(testBed.addEffect);

      await testBed.dispatchHandled(initializeCurrentSessionStateSlice());

      const action = testBed.getDispatchedAction(setIsHydrated);
      expect(action.payload).toBe(true);
    });

    it('logs and continues if keyValueStore throws', async () => {
      const kvStore = makeKeyValueStore({
        getItem: vi.fn().mockRejectedValue(new Error('storage failure')),
      });
      const testBed = createAddEffectTestBed({
        initialState: hydratedSettingsState,
        services: { keyValueStore: kvStore },
      });
      applyCurrentSessionEffects(testBed.addEffect);

      await testBed.dispatchHandled(initializeCurrentSessionStateSlice());

      expect(testBed.mockServices.logger.error).toHaveBeenCalledWith(
        'Failed to initialize current session state',
        expect.objectContaining({ message: 'storage failure' }),
      );
      const dispatched = testBed.getDispatchedAction(setIsHydrated);
      expect(dispatched).toMatchObject({ payload: true });
    });
  });

  // ─── setCurrentSession ────────────────────────────────────────────────────────

  describe('applyCurrentSessionEffects — setCurrentSession', () => {
    it('persists to keyValueStore when hydrated and session state changed', async () => {
      const kvStore = makeKeyValueStore();
      const testBed = createAddEffectTestBed({
        initialState: {
          currentSession: {
            isHydrated: true,
            workoutSession: undefined,
            historySession: undefined,
          },
        },
        services: { keyValueStore: kvStore },
      });
      applyCurrentSessionEffects(testBed.addEffect);

      // setState simulates the reducer having run — stateAfterReduce differs from stateBeforeReduce
      testBed.setStateBeforeReduce({
        currentSession: {
          isHydrated: true,
          workoutSession: EmptySession,
          historySession: undefined,
        },
      });

      await testBed.dispatchHandled(setCurrentSession({ target: 'workoutSession', session: undefined }));

      expect(kvStore.setItem).toHaveBeenCalledWith('CurrentSessionStateV1-Version', '3');
      expect(kvStore.removeItem).toHaveBeenCalledWith('CurrentSessionStateV1');
    });

    it('does not persist when not yet hydrated', async () => {
      const kvStore = makeKeyValueStore();
      const testBed = createAddEffectTestBed({
        initialState: {
          currentSession: {
            isHydrated: false,
            workoutSession: undefined,
            historySession: undefined,
          },
        },
        services: { keyValueStore: kvStore },
      });
      applyCurrentSessionEffects(testBed.addEffect);

      await testBed.dispatchHandled(setCurrentSession({ target: 'workoutSession', session: undefined }));

      expect(kvStore.setItem).not.toHaveBeenCalled();
    });

    it('dispatches currentWorkoutSessionUpdated when workoutSession changes', async () => {
      const before = EmptySession;
      const after = before.with({ id: '1234' });
      const testBed = createAddEffectTestBed({
        initialState: {
          currentSession: {
            isHydrated: true,
            workoutSession: before,
            historySession: undefined,
          },
        },
        services: { keyValueStore: makeKeyValueStore() },
      });
      applyCurrentSessionEffects(testBed.addEffect);

      testBed.setState({
        currentSession: {
          isHydrated: true,
          workoutSession: after,
          historySession: undefined,
        },
      });

      await testBed.dispatchHandled(setCurrentSession({ target: 'workoutSession', session: after }));

      const action = testBed.getDispatchedAction(currentWorkoutSessionUpdated);
      expect(action.payload.before).toBe(before);
      expect(action.payload.after).toBe(after);
    });

    it('does not dispatch currentWorkoutSessionUpdated when workoutSession is unchanged', async () => {
      const session = EmptySession;
      const testBed = createAddEffectTestBed({
        initialState: {
          currentSession: {
            isHydrated: true,
            workoutSession: session,
            historySession: undefined,
          },
        },
        services: { keyValueStore: makeKeyValueStore() },
      });
      applyCurrentSessionEffects(testBed.addEffect);

      // stateAfterReduce same as original — no change
      await testBed.dispatchHandled(setCurrentSession({ target: 'workoutSession', session }));

      testBed.expectNotDispatched(currentWorkoutSessionUpdated);
    });

    it('logs but does not rethrow if persist fails', async () => {
      const kvStore = makeKeyValueStore({
        setItem: vi.fn().mockRejectedValue(new Error('disk full')),
      });
      const testBed = createAddEffectTestBed({
        initialState: {
          currentSession: {
            isHydrated: true,
            workoutSession: undefined,
            historySession: undefined,
          },
        },
        services: { keyValueStore: kvStore },
      });
      applyCurrentSessionEffects(testBed.addEffect);

      testBed.setState({
        currentSession: {
          isHydrated: true,
          workoutSession: { id: 'new' },
          historySession: undefined,
        },
      });

      await expect(
        testBed.dispatchHandled(setCurrentSession({ target: 'workoutSession', session: undefined })),
      ).resolves.not.toThrow();

      expect(testBed.mockServices.logger.error).toHaveBeenCalledWith(
        'Failed to persist current session state',
        expect.objectContaining({ message: 'disk full' }),
      );
    });
  });

  // ─── finishCurrentWorkout ─────────────────────────────────────────────────────

  describe('applyCurrentSessionEffects — finishCurrentWorkout', () => {
    function testBedWithSession(session: Session | undefined) {
      const testBed = createAddEffectTestBed({
        initialState: {
          currentSession: { workoutSession: session, historySession: undefined },
        } as Partial<RootState>,
        services: { keyValueStore: makeKeyValueStore() },
      });
      applyCurrentSessionEffects(testBed.addEffect);
      return testBed;
    }

    it('queues the session id, persists, and marks stats dirty', async () => {
      const session = EmptySession.with({ id: 'abc' });
      const testBed = testBedWithSession(session);

      await testBed.dispatchHandled(finishCurrentWorkout('workoutSession'));

      expect(testBed.getDispatchedAction(addUnpublishedSessionId).payload).toBe('abc');
      expect(testBed.getDispatchedAction(persistCurrentSession).payload).toBe('workoutSession');
      expect(testBed.getDispatchedAction(setStatsIsDirty).payload).toBe(true);
    });

    it('still persists when there is no active session', async () => {
      const testBed = testBedWithSession(undefined);

      await testBed.dispatchHandled(finishCurrentWorkout('workoutSession'));

      testBed.expectNotDispatched(addUnpublishedSessionId);
      expect(testBed.getDispatchedAction(persistCurrentSession).payload).toBe('workoutSession');
    });
  });

  // ─── persistCurrentSession ────────────────────────────────────────────────────

  describe('applyCurrentSessionEffects — persistCurrentSession', () => {
    it('stores the session and clears the current slot', async () => {
      const session = EmptySession.with({ id: 'to-store' });
      const testBed = createAddEffectTestBed({
        initialState: {
          currentSession: { workoutSession: session, historySession: undefined },
        } as Partial<RootState>,
        services: { keyValueStore: makeKeyValueStore(), notificationService: { clearSetTimerNotification: vi.fn() } },
      });
      applyCurrentSessionEffects(testBed.addEffect);

      await testBed.dispatchHandled(persistCurrentSession('workoutSession'));

      expect(testBed.getDispatchedAction(addStoredSession).payload).toBe(session);
      expect(testBed.getDispatchedAction(setCurrentSession).payload).toEqual({
        target: 'workoutSession',
        session: undefined,
      });
      testBed.getDispatchedAction(fetchUpcomingSessions);
    });
  });

  // ─── currentWorkoutSessionUpdated ─────────────────────────────────────────────

  describe('applyCurrentSessionEffects — currentWorkoutSessionUpdated', () => {
    function testBed(settings: Partial<RootState['settings']> = { restNotifications: false }) {
      const bed = createAddEffectTestBed({
        initialState: { settings } as Partial<RootState>,
        services: { keyValueStore: makeKeyValueStore(), workoutWorkerService: { broadcast: vi.fn() } },
      });
      applyCurrentSessionEffects(bed.addEffect);
      return bed;
    }

    function broadcastUpdateEvents(bed: ReturnType<typeof createAddEffectTestBed>): WorkoutUpdatedEvent[] {
      return bed.dispatchedActions
        .filter((a) => a.type === broadcastWorkoutEvent.type)
        .map((a) => (a as ReturnType<typeof broadcastWorkoutEvent>).payload)
        .filter((p): p is WorkoutUpdatedEvent => p.type === 'WorkoutUpdatedEvent');
    }

    it('broadcasts start and update events when a workout begins', async () => {
      const bed = testBed();
      const after = sessionWithRestTimer(OffsetDateTime.of(2025, 4, 5, 10, 0, 0, 0, ZoneOffset.UTC));

      await bed.dispatchHandled(currentWorkoutSessionUpdated({ before: undefined, after }));

      const events = broadcastEventTypes(bed);
      expect(events).toContain('WorkoutStartedEvent');
      expect(events).toContain('WorkoutUpdatedEvent');
    });

    it('includes rest timer info in update events when rest timers are enabled', async () => {
      const bed = testBed({ restTimersEnabled: true });
      const after = sessionWithRestTimer(OffsetDateTime.of(2025, 4, 5, 10, 0, 0, 0, ZoneOffset.UTC));

      await bed.dispatchHandled(currentWorkoutSessionUpdated({ before: undefined, after }));

      const [update] = broadcastUpdateEvents(bed);
      expect(update?.restTimerInfo).toBeDefined();
    });

    it('omits rest timer info from update events when rest timers are disabled', async () => {
      const bed = testBed({ restTimersEnabled: false });
      const after = sessionWithRestTimer(OffsetDateTime.of(2025, 4, 5, 10, 0, 0, 0, ZoneOffset.UTC));

      await bed.dispatchHandled(currentWorkoutSessionUpdated({ before: undefined, after }));

      const [update] = broadcastUpdateEvents(bed);
      expect(update).toBeDefined();
      expect(update?.restTimerInfo).toBeUndefined();
    });

    it('broadcasts an end event when a workout is cleared', async () => {
      const bed = testBed();
      const before = EmptySession.with({ id: 'x' });

      await bed.dispatchHandled(currentWorkoutSessionUpdated({ before, after: undefined }));

      expect(broadcastEventTypes(bed)).toContain('WorkoutEndedEvent');
    });
  });

  // ─── broadcastWorkoutEvent / notifications ────────────────────────────────────

  describe('applyCurrentSessionEffects — broadcast and notifications', () => {
    it('forwards broadcastWorkoutEvent to the worker service', async () => {
      const broadcast = vi.fn();
      const testBed = createAddEffectTestBed({
        services: { keyValueStore: makeKeyValueStore(), workoutWorkerService: { broadcast } },
      });
      applyCurrentSessionEffects(testBed.addEffect);

      await testBed.dispatchHandled(broadcastWorkoutEvent({ type: 'WorkoutEndedEvent' }));

      expect(broadcast).toHaveBeenCalledWith({ type: 'WorkoutEndedEvent' });
    });

    it('clearSetTimerNotification calls the notification service', async () => {
      const clear = vi.fn();
      const testBed = createAddEffectTestBed({
        services: { keyValueStore: makeKeyValueStore(), notificationService: { clearSetTimerNotification: clear } },
      });
      applyCurrentSessionEffects(testBed.addEffect);

      await testBed.dispatchHandled(clearSetTimerNotification());

      expect(clear).toHaveBeenCalled();
    });

    it('notifySetTimer schedules the next notification for a future rest timer', async () => {
      const scheduleNextSetNotification = vi.fn();
      const clearSetTimerNotification = vi.fn();
      const future = OffsetDateTime.now().plusHours(1);
      const testBed = createAddEffectTestBed({
        initialState: {
          settings: { restNotifications: true, restTimersEnabled: true },
          currentSession: { workoutSession: sessionWithRestTimer(future) },
        } as Partial<RootState>,
        services: {
          keyValueStore: makeKeyValueStore(),
          notificationService: { scheduleNextSetNotification, clearSetTimerNotification },
        },
      });
      applyCurrentSessionEffects(testBed.addEffect);

      await testBed.dispatchHandled(notifySetTimer());

      expect(clearSetTimerNotification).toHaveBeenCalled();
      expect(scheduleNextSetNotification).toHaveBeenCalled();
    });

    it('notifySetTimer does nothing extra when rest notifications are disabled', async () => {
      const scheduleNextSetNotification = vi.fn();
      const testBed = createAddEffectTestBed({
        initialState: {
          settings: { restNotifications: false },
          currentSession: { workoutSession: undefined },
        } as Partial<RootState>,
        services: {
          keyValueStore: makeKeyValueStore(),
          notificationService: { scheduleNextSetNotification, clearSetTimerNotification: vi.fn() },
        },
      });
      applyCurrentSessionEffects(testBed.addEffect);

      await testBed.dispatchHandled(notifySetTimer());

      expect(scheduleNextSetNotification).not.toHaveBeenCalled();
    });

    it('notifySetTimer does not schedule when rest timers are disabled', async () => {
      const scheduleNextSetNotification = vi.fn();
      const testBed = createAddEffectTestBed({
        initialState: {
          settings: { restNotifications: true, restTimersEnabled: false },
          currentSession: { workoutSession: sessionWithRestTimer(OffsetDateTime.now().plusHours(1)) },
        } as Partial<RootState>,
        services: {
          keyValueStore: makeKeyValueStore(),
          notificationService: { scheduleNextSetNotification, clearSetTimerNotification: vi.fn() },
        },
      });
      applyCurrentSessionEffects(testBed.addEffect);

      await testBed.dispatchHandled(notifySetTimer());

      expect(scheduleNextSetNotification).not.toHaveBeenCalled();
    });

    it('setRestTimersEnabled rebroadcasts the workout without rest timer info when disabled', async () => {
      const broadcast = vi.fn();
      const testBed = createAddEffectTestBed({
        initialState: {
          settings: { restNotifications: true, restTimersEnabled: false },
          currentSession: {
            workoutSession: sessionWithRestTimer(OffsetDateTime.of(2025, 4, 5, 10, 0, 0, 0, ZoneOffset.UTC)),
          },
        } as Partial<RootState>,
        services: { keyValueStore: makeKeyValueStore(), workoutWorkerService: { broadcast } },
      });
      applyCurrentSessionEffects(testBed.addEffect);

      await testBed.dispatchHandled(setRestTimersEnabled(false));

      testBed.getDispatchedAction(notifySetTimer);
      const update = testBed.getDispatchedAction(broadcastWorkoutEvent).payload as WorkoutUpdatedEvent;
      expect(update.type).toBe('WorkoutUpdatedEvent');
      expect(update.restTimerInfo).toBeUndefined();
    });
  });

  // ─── setCurrentSessionFromBlueprint ───────────────────────────────────────────

  describe('applyCurrentSessionEffects — setCurrentSessionFromBlueprint', () => {
    it('hydrates a session from the blueprint and sets it as current', async () => {
      const hydrated = EmptySession.with({ id: 'hydrated' });
      const hydrateSessionFromBlueprint = vi.fn().mockReturnValue(hydrated);
      const blueprint = new SessionBlueprint('Test', [makeWeightedBlueprint()], '');
      const testBed = createAddEffectTestBed({
        initialState: { storedSessions: { latestExercises: {} } } as Partial<RootState>,
        services: { keyValueStore: makeKeyValueStore(), sessionService: { hydrateSessionFromBlueprint } },
      });
      applyCurrentSessionEffects(testBed.addEffect);

      await testBed.dispatchHandled(setCurrentSessionFromBlueprint({ target: 'workoutSession', blueprint }));

      expect(hydrateSessionFromBlueprint).toHaveBeenCalledWith(blueprint, {});
      expect(testBed.getDispatchedAction(setCurrentSession).payload).toEqual({
        target: 'workoutSession',
        session: hydrated,
      });
    });
  });
});
