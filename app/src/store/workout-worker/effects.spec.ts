import { describe, it, expect, vi } from 'vitest';
import { OffsetDateTime, ZoneOffset } from '@js-joda/core';
import {
  activeSessionUpdated,
  broadcastWorkoutEvent,
  clearSetTimerNotification,
  notifySetTimer,
} from '@/store/workout-worker';
import { applyWorkoutWorkerEffects } from '@/store/workout-worker/effects';
import { RootState } from '@/store/store';
import { createAddEffectTestBed } from '@/utils/__test__/add-effect-testbed';
import { EmptySession, RestTimer, Session } from '@/models/session-models';
import { putStoredSession, setActiveSessionId } from '@/store/stored-sessions';
import { setRestTimersEnabled } from '@/store/settings';
import { WorkoutUpdatedEvent } from '@/models/workout-worker-messages';
import { SessionBlueprint } from '@/models/blueprint-models';
import { RecordedWeightedExercise } from '@/models/session-models/recorded-weighted-exercise';
import { emptyPotentialSet, filledPotentialSet, makeWeightedBlueprint } from '@/models/session-models/__test__/helpers';
import { uuid } from '@/utils/uuid';

function broadcastEventTypes(testBed: ReturnType<typeof createAddEffectTestBed>): string[] {
  return testBed.dispatchedActions
    .filter((a) => a.type === broadcastWorkoutEvent.type)
    .map((a) => (a as unknown as { payload: { type: string } }).payload.type);
}

function broadcastUpdateEvents(bed: ReturnType<typeof createAddEffectTestBed>): WorkoutUpdatedEvent[] {
  return bed.dispatchedActions
    .filter((a) => a.type === broadcastWorkoutEvent.type)
    .map((a) => (a as ReturnType<typeof broadcastWorkoutEvent>).payload)
    .filter((p): p is WorkoutUpdatedEvent => p.type === 'WorkoutUpdatedEvent');
}

function sessionWithRestTimer(restTimerStartTime: OffsetDateTime): Session {
  const bp = makeWeightedBlueprint();
  const exercise = new RecordedWeightedExercise(
    bp,
    [filledPotentialSet(10, restTimerStartTime), emptyPotentialSet(100)],
    undefined,
  );
  return new Session(
    uuid(),
    new SessionBlueprint('Test', [bp], ''),
    [exercise],
    EmptySession.date,
    undefined,
    new RestTimer(restTimerStartTime),
  );
}

/** The slice shape the worker effects read: the session in the map, and the pointer at it. */
function withActiveSession(session: Session | undefined) {
  return {
    sessions: session ? { [session.id]: session } : {},
    activeSessionId: session?.id,
  } as Partial<RootState>['storedSessions'];
}

describe('workout-worker effects', () => {
  describe('activeSessionUpdated', () => {
    function testBed(settings: Partial<RootState['settings']> = { restNotifications: false }) {
      const bed = createAddEffectTestBed({
        initialState: { settings } as Partial<RootState>,
        services: { workoutWorkerService: { broadcast: vi.fn() } },
      });
      applyWorkoutWorkerEffects(bed.addEffect);
      return bed;
    }

    it('broadcasts start and update events when a workout begins', async () => {
      const bed = testBed();
      const after = sessionWithRestTimer(OffsetDateTime.of(2025, 4, 5, 10, 0, 0, 0, ZoneOffset.UTC));

      await bed.dispatchHandled(activeSessionUpdated({ before: undefined, after }));

      const events = broadcastEventTypes(bed);
      expect(events).toContain('WorkoutStartedEvent');
      expect(events).toContain('WorkoutUpdatedEvent');
    });

    it('includes rest timer info in update events when rest timers are enabled', async () => {
      const bed = testBed({ restTimersEnabled: true });
      const after = sessionWithRestTimer(OffsetDateTime.of(2025, 4, 5, 10, 0, 0, 0, ZoneOffset.UTC));

      await bed.dispatchHandled(activeSessionUpdated({ before: undefined, after }));

      const [update] = broadcastUpdateEvents(bed);
      expect(update?.restTimerInfo).toBeDefined();
    });

    it('omits rest timer info from update events when rest timers are disabled', async () => {
      const bed = testBed({ restTimersEnabled: false });
      const after = sessionWithRestTimer(OffsetDateTime.of(2025, 4, 5, 10, 0, 0, 0, ZoneOffset.UTC));

      await bed.dispatchHandled(activeSessionUpdated({ before: undefined, after }));

      const [update] = broadcastUpdateEvents(bed);
      expect(update).toBeDefined();
      expect(update?.restTimerInfo).toBeUndefined();
    });

    it('broadcasts an end event and clears the notification when a workout is cleared', async () => {
      const bed = testBed();
      const before = EmptySession.with({ id: 'x' });

      await bed.dispatchHandled(activeSessionUpdated({ before, after: undefined }));

      expect(broadcastEventTypes(bed)).toContain('WorkoutEndedEvent');
      expect(bed.dispatchedActions.some((a) => a.type === clearSetTimerNotification.type)).toBe(true);
    });

    function notifyDispatched(bed: ReturnType<typeof createAddEffectTestBed>): boolean {
      return bed.dispatchedActions.some((a) => a.type === notifySetTimer.type);
    }

    it('clears the notification by dispatching notifySetTimer when the rest timer is paused', async () => {
      const bed = testBed();
      const before = sessionWithRestTimer(OffsetDateTime.now());
      const after = before.with({ restTimer: before.restTimer!.pause(OffsetDateTime.now()) });

      await bed.dispatchHandled(activeSessionUpdated({ before, after }));

      expect(notifyDispatched(bed)).toBe(true);
    });

    it('clears the notification by dispatching notifySetTimer when the rest timer is dismissed', async () => {
      const bed = testBed();
      const before = sessionWithRestTimer(OffsetDateTime.now());
      const after = before.with({ restTimer: undefined });

      await bed.dispatchHandled(activeSessionUpdated({ before, after }));

      expect(notifyDispatched(bed)).toBe(true);
    });

    it('reschedules by dispatching notifySetTimer when the rest timer is resumed', async () => {
      const bed = testBed();
      const running = sessionWithRestTimer(OffsetDateTime.now());
      const before = running.with({ restTimer: running.restTimer!.pause(OffsetDateTime.now()) });
      const after = before.with({ restTimer: before.restTimer!.resume(OffsetDateTime.now()) });

      await bed.dispatchHandled(activeSessionUpdated({ before, after }));

      expect(notifyDispatched(bed)).toBe(true);
    });

    it('does not dispatch notifySetTimer when the rest timer is unchanged', async () => {
      const bed = testBed();
      const session = sessionWithRestTimer(OffsetDateTime.now());

      await bed.dispatchHandled(activeSessionUpdated({ before: session, after: session }));

      expect(notifyDispatched(bed)).toBe(false);
    });
  });

  describe('deriving activeSessionUpdated from the store', () => {
    it('fires when a session becomes the active one', async () => {
      const session = sessionWithRestTimer(OffsetDateTime.now());
      const bed = createAddEffectTestBed({
        initialState: { settings: {}, storedSessions: withActiveSession(session) } as Partial<RootState>,
        services: { workoutWorkerService: { broadcast: vi.fn() } },
      });
      applyWorkoutWorkerEffects(bed.addEffect);
      bed.setStateBeforeReduce({ storedSessions: withActiveSession(undefined) } as Partial<RootState>);

      await bed.dispatchHandled(setActiveSessionId(session.id));

      const update = bed.getDispatchedAction(activeSessionUpdated);
      expect(update.payload.before).toBeUndefined();
      expect(update.payload.after).toBe(session);
    });

    it('does not fire when an unrelated session is stored', async () => {
      const active = sessionWithRestTimer(OffsetDateTime.now());
      const other = EmptySession.with({ id: 'other' });
      const state = { settings: {}, storedSessions: withActiveSession(active) } as Partial<RootState>;
      const bed = createAddEffectTestBed({
        initialState: state,
        services: { workoutWorkerService: { broadcast: vi.fn() } },
      });
      applyWorkoutWorkerEffects(bed.addEffect);

      await bed.dispatchHandled(putStoredSession(other));

      expect(bed.dispatchedActions.some((a) => a.type === activeSessionUpdated.type)).toBe(false);
    });
  });

  describe('broadcast and notifications', () => {
    it('forwards broadcastWorkoutEvent to the worker service', async () => {
      const broadcast = vi.fn();
      const testBed = createAddEffectTestBed({
        services: { workoutWorkerService: { broadcast } },
      });
      applyWorkoutWorkerEffects(testBed.addEffect);

      await testBed.dispatchHandled(broadcastWorkoutEvent({ type: 'WorkoutEndedEvent' }));

      expect(broadcast).toHaveBeenCalledWith({ type: 'WorkoutEndedEvent' });
    });

    it('clearSetTimerNotification calls the notification service', async () => {
      const clear = vi.fn();
      const testBed = createAddEffectTestBed({
        services: { notificationService: { clearSetTimerNotification: clear } },
      });
      applyWorkoutWorkerEffects(testBed.addEffect);

      await testBed.dispatchHandled(clearSetTimerNotification());

      expect(clear).toHaveBeenCalled();
    });

    function notifyTestBed(settings: Partial<RootState['settings']>, session: Session | undefined) {
      const scheduleNextSetNotification = vi.fn();
      const clearSetTimerNotification = vi.fn();
      const testBed = createAddEffectTestBed({
        initialState: { settings, storedSessions: withActiveSession(session) } as Partial<RootState>,
        services: {
          notificationService: { scheduleNextSetNotification, clearSetTimerNotification },
        },
      });
      applyWorkoutWorkerEffects(testBed.addEffect);
      return { testBed, scheduleNextSetNotification, clearSetTimerNotification };
    }

    it('notifySetTimer schedules the next notification for a future rest timer', async () => {
      const { testBed, scheduleNextSetNotification, clearSetTimerNotification } = notifyTestBed(
        { restNotifications: true, restTimersEnabled: true },
        sessionWithRestTimer(OffsetDateTime.now().plusHours(1)),
      );

      await testBed.dispatchHandled(notifySetTimer());

      expect(clearSetTimerNotification).toHaveBeenCalled();
      expect(scheduleNextSetNotification).toHaveBeenCalled();
    });

    it('notifySetTimer does nothing extra when rest notifications are disabled', async () => {
      const { testBed, scheduleNextSetNotification } = notifyTestBed({ restNotifications: false }, undefined);

      await testBed.dispatchHandled(notifySetTimer());

      expect(scheduleNextSetNotification).not.toHaveBeenCalled();
    });

    it('notifySetTimer does not schedule when rest timers are disabled', async () => {
      const { testBed, scheduleNextSetNotification } = notifyTestBed(
        { restNotifications: true, restTimersEnabled: false },
        sessionWithRestTimer(OffsetDateTime.now().plusHours(1)),
      );

      await testBed.dispatchHandled(notifySetTimer());

      expect(scheduleNextSetNotification).not.toHaveBeenCalled();
    });

    it('notifySetTimer clears without scheduling when there is no active rest timer', async () => {
      const { testBed, scheduleNextSetNotification, clearSetTimerNotification } = notifyTestBed(
        { restNotifications: true, restTimersEnabled: true },
        undefined,
      );

      await testBed.dispatchHandled(notifySetTimer());

      expect(clearSetTimerNotification).toHaveBeenCalled();
      expect(scheduleNextSetNotification).not.toHaveBeenCalled();
    });

    it('notifySetTimer clears without scheduling when the rest timer is paused', async () => {
      const running = sessionWithRestTimer(OffsetDateTime.now().plusHours(1));
      const { testBed, scheduleNextSetNotification, clearSetTimerNotification } = notifyTestBed(
        { restNotifications: true, restTimersEnabled: true },
        running.with({ restTimer: running.restTimer!.pause(OffsetDateTime.now()) }),
      );

      await testBed.dispatchHandled(notifySetTimer());

      expect(clearSetTimerNotification).toHaveBeenCalled();
      expect(scheduleNextSetNotification).not.toHaveBeenCalled();
    });

    it('notifySetTimer clears without scheduling when the rest timer has already ended', async () => {
      const { testBed, scheduleNextSetNotification, clearSetTimerNotification } = notifyTestBed(
        { restNotifications: true, restTimersEnabled: true },
        sessionWithRestTimer(OffsetDateTime.now().minusHours(1)),
      );

      await testBed.dispatchHandled(notifySetTimer());

      expect(clearSetTimerNotification).toHaveBeenCalled();
      expect(scheduleNextSetNotification).not.toHaveBeenCalled();
    });

    it('setRestTimersEnabled rebroadcasts the workout without rest timer info when disabled', async () => {
      const broadcast = vi.fn();
      const session = sessionWithRestTimer(OffsetDateTime.of(2025, 4, 5, 10, 0, 0, 0, ZoneOffset.UTC));
      const testBed = createAddEffectTestBed({
        initialState: {
          settings: { restNotifications: true, restTimersEnabled: false },
          storedSessions: withActiveSession(session),
        } as Partial<RootState>,
        services: { workoutWorkerService: { broadcast } },
      });
      applyWorkoutWorkerEffects(testBed.addEffect);

      await testBed.dispatchHandled(setRestTimersEnabled(false));

      testBed.getDispatchedAction(notifySetTimer);
      const update = testBed.getDispatchedAction(broadcastWorkoutEvent).payload as WorkoutUpdatedEvent;
      expect(update.type).toBe('WorkoutUpdatedEvent');
      expect(update.restTimerInfo).toBeUndefined();
    });
  });
});
