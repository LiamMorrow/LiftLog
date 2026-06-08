/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import Ajv from 'ajv';
import { readdirSync, readFileSync } from 'fs';
import path from 'path';
import { describe, it, expect, beforeAll } from 'vitest';
import {
  RecordedWeightedExercise,
  RecordedCardioExercise,
  Session,
  EmptySession,
} from '@/models/session-models';
import {
  WeightedExerciseBlueprint,
  CardioExerciseBlueprint,
  CardioExerciseSetBlueprint,
  NoProgressiveOverload,
} from '@/models/blueprint-models';
import { Weight } from '@/models/weight';
import { Duration, Instant, OffsetDateTime, ZoneOffset } from '@js-joda/core';
import type {
  WorkoutMessage,
  WorkoutStartedEvent,
  WorkoutUpdatedEvent,
  WorkoutEndedEvent,
  FinishWorkoutCommand,
  Translations,
  AppConfiguration,
} from './workout-worker-messages';
import {
  toDurationJSON,
  toInstantJson,
} from '@/models/storage/versions/latest';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const SCHEMA_DIR = path.resolve('../docs/schemas/workout-worker');

function loadSchemas(): Ajv {
  const ajv = new Ajv({ validateFormats: false, discriminator: true });

  const files = readdirSync(SCHEMA_DIR).filter((f) => f.endsWith('.json'));

  for (const file of files) {
    const fullPath = path.join(SCHEMA_DIR, file);
    const schema = JSON.parse(readFileSync(fullPath, 'utf-8'));

    // Register with a URI matching the relative $ref pattern the other schemas use
    ajv.addSchema(schema, file);
  }

  return ajv;
}

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const NOW: OffsetDateTime = OffsetDateTime.now(ZoneOffset.UTC);

const TRANSLATIONS: Translations = {
  workoutPersistentNotificationRestBreakMessage: 'Rest break',
  workoutPersistentNotificationStartSoonMessage: 'Starting soon',
  workoutPersistentNotificationStartNowMessage: 'Start now',
  workoutPersistentNotificationMinRestOverMessage: 'Min rest over',
  workoutPersistentNotificationMaxRestOverMessage: 'Max rest over',
  workoutPersistentNotificationCurrentExerciseMessage: 'Current exercise',
  workoutPersistentNotificationFinishedMessage: 'Finished',
  workoutPersistentNotificationInProgressMessage: 'Workout in progress',
  workoutPersistentNotificationFinishWorkoutAction: 'Finish',
};

const APP_CONFIG: AppConfiguration = {
  notificationsEnabled: true,
};

function makeWeightedExercise(): RecordedWeightedExercise {
  // Build a minimal WeightedExerciseBlueprint via fromJSON so we don't need
  // to import the constructor directly.
  const blueprintJson = {
    name: 'Bench Press',
    sets: 3,
    repsPerSet: 10,
    progressiveOverload: new NoProgressiveOverload(),
  };
  const blueprint = WeightedExerciseBlueprint.empty().with(blueprintJson);
  return RecordedWeightedExercise.empty(blueprint, 'kilograms');
}

function makeWeightedExerciseWithSets(): RecordedWeightedExercise {
  const exercise = makeWeightedExercise();
  // Complete all sets
  return exercise.potentialSets.reduce(
    (ex, _set, index) => ex.withRepCount(index, 10, NOW),
    exercise,
  );
}

function makeCardioExercise(): RecordedCardioExercise {
  const setBlueprint = CardioExerciseSetBlueprint.empty().with({
    target: { type: 'time' as const, value: Duration.ofMinutes(30) },
    trackDuration: true,
    trackDistance: false,
    trackSteps: false,
    trackResistance: false,
    trackWeight: false,
    trackIncline: false,
  });
  const blueprint = CardioExerciseBlueprint.empty().with({
    name: 'Treadmill',
    sets: [setBlueprint],
  });
  return RecordedCardioExercise.empty(blueprint);
}

function makeSession(): Session {
  return EmptySession;
}

function wrapMessage(payload: WorkoutMessage['payload']): WorkoutMessage {
  return {
    translations: TRANSLATIONS,
    appConfiguration: APP_CONFIG,
    payload,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('WorkoutMessage JSON schema validation', () => {
  let ajv: Ajv;

  beforeAll(() => {
    ajv = loadSchemas();
  });

  function validate(schemaFile: string, data: unknown): boolean {
    const valid = ajv.validate(`${schemaFile}.json`, data);
    return !!valid;
  }

  // -------------------------------------------------------------------------
  // Payload-level schemas
  // -------------------------------------------------------------------------

  describe('WorkoutStartedEvent', () => {
    it('validates a WorkoutStartedEvent payload', () => {
      const payload: WorkoutStartedEvent = { type: 'WorkoutStartedEvent' };
      expect(validate('WorkoutStartedEvent', payload)).toBe(true);
    });
  });

  describe('WorkoutEndedEvent', () => {
    it('validates a WorkoutEndedEvent payload', () => {
      const payload: WorkoutEndedEvent = { type: 'WorkoutEndedEvent' };
      expect(validate('WorkoutEndedEvent', payload)).toBe(true);
    });
  });

  describe('FinishWorkoutCommand', () => {
    it('validates a FinishWorkoutCommand payload', () => {
      const payload: FinishWorkoutCommand = { type: 'FinishWorkoutCommand' };
      expect(validate('FinishWorkoutCommand', payload)).toBe(true);
    });
  });

  describe('WorkoutUpdatedEvent', () => {
    it('validates a WorkoutUpdatedEvent with no active timers or current exercise', () => {
      const session = makeSession();
      const payload: WorkoutUpdatedEvent = {
        type: 'WorkoutUpdatedEvent',
        workout: session.toJSON(),
        restTimerInfo: undefined,
        cardioTimerInfo: undefined,
        currentExerciseDetails: undefined,
        totalWeightLifted: new Weight(0, 'kilograms').toJSON(),
        workoutDuration: toDurationJSON(Duration.parse('PT0S')), // DurationJSON — ISO-8601 string
      };
      expect(validate('WorkoutUpdatedEvent', payload)).toBe(true);
    });

    it('validates a WorkoutUpdatedEvent with a weighted current exercise', () => {
      const session = makeSession();
      const exercise = makeWeightedExercise();
      const payload: WorkoutUpdatedEvent = {
        type: 'WorkoutUpdatedEvent',
        workout: session.toJSON(),
        restTimerInfo: undefined,
        cardioTimerInfo: undefined,
        currentExerciseDetails: {
          exercise: exercise.toJSON(),
          setIndex: 0,
        },
        totalWeightLifted: new Weight(0, 'kilograms').toJSON(),
        workoutDuration: toDurationJSON(Duration.parse('PT5M30S')),
      };
      expect(validate('WorkoutUpdatedEvent', payload)).toBe(true);
    });

    it('validates a WorkoutUpdatedEvent with a cardio current exercise', () => {
      const session = makeSession();
      const exercise = makeCardioExercise();
      const payload: WorkoutUpdatedEvent = {
        type: 'WorkoutUpdatedEvent',
        workout: session.toJSON(),
        restTimerInfo: undefined,
        cardioTimerInfo: undefined,
        currentExerciseDetails: {
          exercise: exercise.toJSON(),
          setIndex: 0,
        },
        totalWeightLifted: new Weight(0, 'kilograms').toJSON(),
        workoutDuration: toDurationJSON(Duration.parse('PT5M30S')),
      };
      expect(validate('WorkoutUpdatedEvent', payload)).toBe(true);
    });

    it('validates a WorkoutUpdatedEvent with an active rest timer', () => {
      const session = makeSession();
      const startInstant = Instant.now();
      const payload: WorkoutUpdatedEvent = {
        type: 'WorkoutUpdatedEvent',
        workout: session.toJSON(),
        restTimerInfo: {
          startedAt: toInstantJson(startInstant),
          partiallyEndAt: toInstantJson(startInstant.plusSeconds(30)),
          endAt: toInstantJson(startInstant.plusSeconds(90)),
        },
        cardioTimerInfo: undefined,
        currentExerciseDetails: undefined,
        totalWeightLifted: new Weight(100, 'kilograms').toJSON(),
        workoutDuration: toDurationJSON(Duration.parse('PT5M30S')),
      };
      expect(validate('WorkoutUpdatedEvent', payload)).toBe(true);
    });

    it('validates a WorkoutUpdatedEvent with an active cardio timer', () => {
      const session = makeSession();
      const exercise = makeCardioExercise();
      const startInstant = Instant.now();
      const payload: WorkoutUpdatedEvent = {
        type: 'WorkoutUpdatedEvent',
        workout: session.toJSON(),
        restTimerInfo: undefined,
        cardioTimerInfo: {
          currentDuration: toDurationJSON(Duration.parse('PT5M')),
          currentBlockStartTime: toInstantJson(startInstant),
          exerciseIndex: 0,
          setIndex: 0,
        },
        currentExerciseDetails: {
          exercise: exercise.toJSON(),
          setIndex: 0,
        },
        totalWeightLifted: new Weight(0, 'kilograms').toJSON(),
        workoutDuration: toDurationJSON(Duration.parse('PT5M30S')),
      };
      expect(validate('WorkoutUpdatedEvent', payload)).toBe(true);
    });

    it('validates a WorkoutUpdatedEvent with a completed weighted exercise and accumulated weight', () => {
      const exercise = makeWeightedExerciseWithSets();
      const session = makeSession();
      const payload: WorkoutUpdatedEvent = {
        type: 'WorkoutUpdatedEvent',
        workout: session.toJSON(),
        restTimerInfo: undefined,
        cardioTimerInfo: undefined,
        currentExerciseDetails: {
          exercise: exercise.toJSON(),
          setIndex: exercise.currentSetIndex,
        },
        totalWeightLifted: exercise.totalWeightLifted.toJSON(),
        workoutDuration: toDurationJSON(Duration.parse('PT5M30S')),
      };
      expect(validate('WorkoutUpdatedEvent', payload)).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // Full WorkoutMessage wrapper
  // -------------------------------------------------------------------------

  describe('WorkoutMessage', () => {
    it('validates a full WorkoutMessage wrapping WorkoutStartedEvent', () => {
      const message = wrapMessage({ type: 'WorkoutStartedEvent' });
      expect(validate('WorkoutMessage', message)).toBe(true);
    });

    it('validates a full WorkoutMessage wrapping WorkoutEndedEvent', () => {
      const message = wrapMessage({ type: 'WorkoutEndedEvent' });
      expect(validate('WorkoutMessage', message)).toBe(true);
    });

    it('validates a full WorkoutMessage wrapping FinishWorkoutCommand', () => {
      const message = wrapMessage({ type: 'FinishWorkoutCommand' });
      expect(validate('WorkoutMessage', message)).toBe(true);
    });

    it('validates a full WorkoutMessage wrapping WorkoutUpdatedEvent', () => {
      const session = makeSession();
      const message = wrapMessage({
        type: 'WorkoutUpdatedEvent',
        workout: session.toJSON(),
        restTimerInfo: undefined,
        cardioTimerInfo: undefined,
        currentExerciseDetails: undefined,
        totalWeightLifted: new Weight(0, 'kilograms').toJSON(),
        workoutDuration: toDurationJSON(Duration.parse('PT5M30S')),
      });
      expect(validate('WorkoutMessage', message)).toBe(true);
    });

    it('validates a WorkoutMessage with notifications disabled', () => {
      const message: WorkoutMessage = {
        translations: TRANSLATIONS,
        appConfiguration: { notificationsEnabled: false },
        payload: { type: 'WorkoutStartedEvent' },
      };
      expect(validate('WorkoutMessage', message)).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // Sub-component schemas — useful for diagnosing failures in isolation
  // -------------------------------------------------------------------------

  describe('RecordedWeightedExercise', () => {
    it('validates an empty (no sets completed) exercise', () => {
      expect(
        validate('RecordedWeightedExercise', makeWeightedExercise().toJSON()),
      ).toBe(true);
    });

    it('validates a fully completed exercise', () => {
      expect(
        validate(
          'RecordedWeightedExercise',
          makeWeightedExerciseWithSets().toJSON(),
        ),
      ).toBe(true);
    });
  });

  describe('RecordedCardioExercise', () => {
    it('validates an empty cardio exercise', () => {
      expect(
        validate('RecordedCardioExercise', makeCardioExercise().toJSON()),
      ).toBe(true);
    });

    it('validates a cardio exercise with a completed set', () => {
      const exercise = makeCardioExercise().withSet(0, (s) =>
        s.with({
          duration: Duration.ofMinutes(30),
          completionDateTime: NOW,
        }),
      );
      expect(validate('RecordedCardioExercise', exercise.toJSON())).toBe(true);
    });
  });

  describe('Translations', () => {
    it('validates the translations object', () => {
      expect(validate('Translations', TRANSLATIONS)).toBe(true);
    });
  });

  describe('AppConfiguration', () => {
    it('validates AppConfiguration with notifications enabled', () => {
      expect(validate('AppConfiguration', { notificationsEnabled: true })).toBe(
        true,
      );
    });

    it('validates AppConfiguration with notifications disabled', () => {
      expect(
        validate('AppConfiguration', { notificationsEnabled: false }),
      ).toBe(true);
    });
  });
  // -------------------------------------------------------------------------
  // Negative tests — invalid payloads that should fail validation
  // -------------------------------------------------------------------------

  describe('Invalid payloads (should fail validation)', () => {
    describe('WorkoutStartedEvent', () => {
      it('rejects a payload with the wrong type discriminator', () => {
        expect(
          validate('WorkoutStartedEvent', { type: 'WorkoutEndedEvent' }),
        ).toBe(false);
      });

      it('rejects a payload missing the type field', () => {
        expect(validate('WorkoutStartedEvent', {})).toBe(false);
      });
    });

    describe('WorkoutUpdatedEvent', () => {
      it('rejects a payload missing required fields', () => {
        expect(
          validate('WorkoutUpdatedEvent', { type: 'WorkoutUpdatedEvent' }),
        ).toBe(false);
      });

      it('rejects a payload where totalWeightLifted has an unknown unit', () => {
        const session = makeSession();
        const payload = {
          type: 'WorkoutUpdatedEvent',
          workout: session.toJSON(),
          restTimerInfo: undefined,
          cardioTimerInfo: undefined,
          currentExerciseDetails: undefined,
          totalWeightLifted: { value: 0, unit: 'stones' }, // invalid unit
          workoutDuration: toDurationJSON(Duration.parse('PT0S')),
        };
        expect(validate('WorkoutUpdatedEvent', payload)).toBe(false);
      });

      it('rejects a restTimerInfo missing endAt', () => {
        const session = makeSession();
        const startInstant = Instant.now();
        const payload = {
          type: 'WorkoutUpdatedEvent',
          workout: session.toJSON(),
          restTimerInfo: {
            startedAt: toInstantJson(startInstant),
            partiallyEndAt: toInstantJson(startInstant.plusSeconds(30)),
            // endAt intentionally omitted
          },
          cardioTimerInfo: undefined,
          currentExerciseDetails: undefined,
          totalWeightLifted: new Weight(0, 'kilograms').toJSON(),
          workoutDuration: toDurationJSON(Duration.parse('PT0S')),
        };
        expect(validate('WorkoutUpdatedEvent', payload)).toBe(false);
      });

      it('rejects a cardioTimerInfo with a missing exerciseIndex', () => {
        const session = makeSession();
        const startInstant = Instant.now();
        const payload = {
          type: 'WorkoutUpdatedEvent',
          workout: session.toJSON(),
          restTimerInfo: undefined,
          cardioTimerInfo: {
            currentDuration: toDurationJSON(Duration.parse('PT5M')),
            currentBlockStartTime: toInstantJson(startInstant),
            setIndex: 0,
          },
          currentExerciseDetails: undefined,
          totalWeightLifted: new Weight(0, 'kilograms').toJSON(),
          workoutDuration: toDurationJSON(Duration.parse('PT0S')),
        };
        expect(validate('WorkoutUpdatedEvent', payload)).toBe(false);
      });
    });

    describe('WorkoutMessage', () => {
      it('rejects a message missing translations', () => {
        expect(
          validate('WorkoutMessage', {
            appConfiguration: APP_CONFIG,
            payload: { type: 'WorkoutStartedEvent' },
          }),
        ).toBe(false);
      });

      it('rejects a message missing appConfiguration', () => {
        expect(
          validate('WorkoutMessage', {
            translations: TRANSLATIONS,
            payload: { type: 'WorkoutStartedEvent' },
          }),
        ).toBe(false);
      });

      it('rejects a message with an unknown payload type', () => {
        expect(
          validate('WorkoutMessage', {
            translations: TRANSLATIONS,
            appConfiguration: APP_CONFIG,
            payload: { type: 'UnknownEvent' },
          }),
        ).toBe(false);
      });
    });

    describe('AppConfiguration', () => {
      it('rejects an AppConfiguration missing notificationsEnabled', () => {
        expect(validate('AppConfiguration', {})).toBe(false);
      });

      it('rejects an AppConfiguration where notificationsEnabled is not a boolean', () => {
        expect(
          validate('AppConfiguration', { notificationsEnabled: 'yes' }),
        ).toBe(false);
      });
    });

    describe('Translations', () => {
      it('rejects a translations object missing a required key', () => {
        const { workoutPersistentNotificationRestBreakMessage: _, ...partial } =
          TRANSLATIONS;
        expect(validate('Translations', partial)).toBe(false);
      });

      it('rejects a translations object where a value is not a string', () => {
        expect(
          validate('Translations', {
            ...TRANSLATIONS,
            workoutPersistentNotificationRestBreakMessage: 42,
          }),
        ).toBe(false);
      });
    });

    describe('RecordedWeightedExercise', () => {
      it('rejects an exercise missing its blueprint name', () => {
        const json = makeWeightedExercise().toJSON() as Record<string, unknown>;
        const blueprint = { ...(json.blueprint as Record<string, unknown>) };
        delete blueprint.name;
        expect(
          validate('RecordedWeightedExercise', { ...json, blueprint }),
        ).toBe(false);
      });
    });
  });
});
