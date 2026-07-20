import { describe, it, expect } from 'vitest';
import {
  ProgramBlueprintJSON as InitialProgramBlueprintJSON,
  SessionBlueprintJSON as InitialSessionBlueprintJSON,
  WeightedExerciseBlueprintJSON as InitialWeightedExerciseBlueprintJSON,
  CardioExerciseBlueprintJSON,
  CardioExerciseSetBlueprintJSON,
  SessionJSON as InitialSessionJSON,
  AiPlanJSON as InitialAiPlanJSON,
  SessionUserEventJSON as InitialSessionUserEventJSON,
  RemovedSessionUserEventJSON as InitialRemovedSessionUserEventJSON,
  SharedSessionJSON as InitialSharedSessionJSON,
  SharedProgramBlueprintJSON as InitialSharedProgramBlueprintJSON,
  FollowedFeedUserJSON as InitialFollowedFeedUserJSON,
} from '@/models/storage/versions/initial';
import { AesKeyJSON, BigNumberJSON, DurationJSON, InstantJSON, LocalDateJSON, RsaPublicKeyJSON } from '@/models/storage/versions/libs';
import { WeightJSON, WeightUnitJSON } from '@/models/storage/versions/libs/weight';
import { programBlueprintMigrations, sessionBlueprintMigrations } from './blueprint';
import { sessionMigrations } from './session';
import { aiPlanMigrations } from './ai-plan';
import {
  followedFeedUserMigrations,
  removedSessionUserEventMigrations,
  sessionUserEventMigrations,
  sharedProgramBlueprintMigrations,
  sharedSessionMigrations,
  userEventMigrations,
} from './feed';

// ---------- branded-primitive helpers ----------
const bn = (v: string) => v as BigNumberJSON;
const dur = (v: string) => v as DurationJSON;
const date = (v: string) => v as LocalDateJSON;
const instant = (v: string) => v as InstantJSON;
const wt = (value: string, unit: WeightUnitJSON = 'kilograms'): WeightJSON => ({ unit, value: bn(value) });

// ---------- initial (v1) fixtures ----------
function initialWeighted(overrides: Partial<InitialWeightedExerciseBlueprintJSON> = {}): InitialWeightedExerciseBlueprintJSON {
  return {
    type: 'WeightedExerciseBlueprint',
    name: 'Bench Press',
    sets: 3,
    repsPerSet: 5,
    weightIncreaseOnSuccess: bn('2.5'),
    restBetweenSets: { minRest: dur('PT1M'), maxRest: dur('PT3M'), failureRest: dur('PT5M') },
    supersetWithNext: false,
    notes: '',
    link: '',
    ...overrides,
  };
}

function cardioSet(): CardioExerciseSetBlueprintJSON {
  return {
    target: { type: 'time', value: dur('PT30M') },
    trackDuration: true,
    trackDistance: false,
    trackResistance: false,
    trackIncline: false,
    trackWeight: false,
    trackSteps: false,
  };
}

function initialCardio(): CardioExerciseBlueprintJSON {
  return { type: 'CardioExerciseBlueprint', name: 'Treadmill', sets: [cardioSet()], notes: '', link: '' };
}

function initialSessionBlueprint(): InitialSessionBlueprintJSON {
  return { name: 'Push Day', exercises: [initialWeighted(), initialCardio()], notes: 'session notes' };
}

function initialProgramBlueprint(): InitialProgramBlueprintJSON {
  return { name: 'PPL', sessions: [initialSessionBlueprint()], lastEdited: date('2024-01-01') };
}

function initialSession(): InitialSessionJSON {
  return {
    id: 'session-1',
    blueprint: initialSessionBlueprint(),
    recordedExercises: [
      {
        type: 'RecordedWeightedExercise',
        blueprint: initialWeighted(),
        potentialSets: [{ set: undefined, weight: wt('60') }],
        notes: '',
      },
      { type: 'RecordedCardioExercise', blueprint: initialCardio(), sets: [], notes: '' },
    ],
    date: date('2024-02-02'),
    bodyweight: wt('80'),
  };
}

describe('real migrations', () => {
  describe('sessionBlueprintMigrations (leaf)', () => {
    it('migrates a weighted exercise from v1 to latest: repsPerSet → repsConfig, weightIncrease → progressiveOverload', () => {
      const result = sessionBlueprintMigrations.migrate(initialSessionBlueprint());
      const weighted = result.exercises[0]!;
      expect(result.version).toBe(3);
      expect(weighted).toMatchObject({
        type: 'WeightedExerciseBlueprint',
        sets: 3,
        repsConfig: { type: 'fixed', reps: 5 },
        progressiveOverload: { type: 'IncreaseAllEvenlyProgressiveOverload', amount: '2.5' },
      });
      expect('repsPerSet' in weighted).toBe(false);
      expect('weightIncreaseOnSuccess' in weighted).toBe(false);
    });

    it('maps a zero weight increase to NoProgressiveOverload', () => {
      const bp = initialSessionBlueprint();
      bp.exercises[0] = initialWeighted({ weightIncreaseOnSuccess: bn('0') });
      const weighted = sessionBlueprintMigrations.migrate(bp).exercises[0]!;
      expect(weighted).toMatchObject({ progressiveOverload: { type: 'NoProgressiveOverload' } });
    });

    it('passes a cardio exercise through unchanged', () => {
      const result = sessionBlueprintMigrations.migrate(initialSessionBlueprint());
      expect(result.exercises[1]).toEqual(initialCardio());
    });

    it('is idempotent', () => {
      const once = sessionBlueprintMigrations.migrate(initialSessionBlueprint());
      expect(sessionBlueprintMigrations.migrate(once)).toEqual(once);
    });
  });

  describe('programBlueprintMigrations (wrapper of sessionBlueprint)', () => {
    it('accepts and migrates a v1 program to latest', () => {
      const result = programBlueprintMigrations.migrate(initialProgramBlueprint());
      expect(result.version).toBe(3);
      expect(result.name).toBe('PPL');
      expect(result.sessions.every((s) => s.version === 3)).toBe(true);
    });

    it('accepts embedded session blueprints at mixed versions and brings them all to latest', () => {
      const v1 = initialSessionBlueprint();
      const v2 = sessionBlueprintMigrations.migrateUntil(initialSessionBlueprint(), 2);
      const v3 = sessionBlueprintMigrations.migrate(initialSessionBlueprint());

      const result = programBlueprintMigrations.migrate({
        name: 'Mixed',
        lastEdited: date('2024-03-03'),
        sessions: [v1, v2, v3],
      });

      expect(result.sessions).toHaveLength(3);
      expect(result.sessions.every((s) => s.version === 3)).toBe(true);
      // every embedded session ends up identical to migrating it directly, regardless of the version it came in at
      const expected = sessionBlueprintMigrations.migrate(initialSessionBlueprint());
      for (const session of result.sessions) {
        expect(session).toEqual(expected);
      }
    });

    it('keeps the program version at 3 even though the child blueprint bumped to 3', () => {
      // the wrapper stamps its own legacy pseudo-version; the child carries its own
      const result = programBlueprintMigrations.migrate(initialProgramBlueprint());
      expect(result.version).toBe(3);
      expect(result.sessions[0]!.version).toBe(3);
    });

    it('is idempotent', () => {
      const once = programBlueprintMigrations.migrate(initialProgramBlueprint());
      expect(programBlueprintMigrations.migrate(once)).toEqual(once);
    });

    it('rejects a program from a newer app version', () => {
      expect(() =>
        programBlueprintMigrations.migrate({
          version: 4,
          name: 'future',
          lastEdited: date('2024-01-01'),
          sessions: [],
        } as never),
      ).toThrow();
    });
  });

  describe('sessionMigrations (started with an embedded blueprint, then moved away from it)', () => {
    it('strips the exercises off the stored blueprint', () => {
      const result = sessionMigrations.migrate(initialSession());
      expect(result.version).toBe(3);
      expect(result.blueprint).toEqual({ name: 'Push Day', notes: 'session notes' });
      expect('exercises' in result.blueprint).toBe(false);
    });

    it('migrates the recorded weighted exercise blueprint to latest', () => {
      const result = sessionMigrations.migrate(initialSession());
      const recorded = result.recordedExercises[0];
      expect(recorded?.type).toBe('RecordedWeightedExercise');
      if (recorded?.type === 'RecordedWeightedExercise') {
        expect(recorded.blueprint.repsConfig).toEqual({ type: 'fixed', reps: 5 });
        expect(recorded.blueprint).toHaveProperty('progressiveOverload');
        expect('repsPerSet' in recorded.blueprint).toBe(false);
      }
    });

    it('is idempotent', () => {
      const once = sessionMigrations.migrate(initialSession());
      expect(sessionMigrations.migrate(once)).toEqual(once);
    });
  });

  describe('aiPlanMigrations (wrapper of programBlueprint)', () => {
    it('migrates the embedded blueprint to latest and preserves plan fields', () => {
      const plan: InitialAiPlanJSON = {
        name: 'Strength',
        description: 'get strong',
        blueprint: initialProgramBlueprint(),
      };
      const result = aiPlanMigrations.migrate(plan);
      expect(result.version).toBe(3);
      expect(result.name).toBe('Strength');
      expect(result.description).toBe('get strong');
      expect(result.blueprint.version).toBe(3);
      expect(result.blueprint.sessions.every((s) => s.version === 3)).toBe(true);
    });
  });

  describe('feed wrappers', () => {
    it('sessionUserEvent brings its embedded session to latest', () => {
      const result = sessionUserEventMigrations.migrate(initialSessionUserEvent());
      expect(result.version).toBe(3);
      expect(result.session.version).toBe(3);
      expect(result.session.blueprint).toEqual({ name: 'Push Day', notes: 'session notes' });
    });

    it('sharedSession brings its embedded session to latest', () => {
      const shared: InitialSharedSessionJSON = { type: 'SharedSession', session: initialSession() };
      const result = sharedSessionMigrations.migrate(shared);
      expect(result.version).toBe(3);
      expect(result.session.version).toBe(3);
    });

    it('sharedProgramBlueprint brings its embedded program to latest', () => {
      const shared: InitialSharedProgramBlueprintJSON = {
        type: 'SharedProgramBlueprint',
        programBlueprint: initialProgramBlueprint(),
      };
      const result = sharedProgramBlueprintMigrations.migrate(shared);
      expect(result.version).toBe(3);
      expect(result.programBlueprint.version).toBe(3);
      expect(result.programBlueprint.sessions.every((s) => s.version === 3)).toBe(true);
    });

    it('followedFeedUser brings its currentPlan to latest', () => {
      const result = followedFeedUserMigrations.migrate(initialFollowedFeedUser(initialProgramBlueprint()));
      expect(result.version).toBe(3);
      expect(result.currentPlan?.version).toBe(3);
      expect(result.currentPlan?.sessions.every((s) => s.version === 3)).toBe(true);
    });

    it('followedFeedUser leaves an absent currentPlan absent', () => {
      const result = followedFeedUserMigrations.migrate(initialFollowedFeedUser(undefined));
      expect(result.version).toBe(3);
      expect(result.currentPlan).toBeUndefined();
    });
  });

  describe('intermediate-version inputs', () => {
    it('picks up a session part-way through its chain and finishes it (v2 → latest)', () => {
      const v2 = sessionMigrations.migrateUntil(initialSession(), 2);
      // v2 has already stripped the blueprint but not yet converted repsPerSet
      expect('exercises' in v2.blueprint).toBe(false);
      const result = sessionMigrations.migrate(v2);
      expect(result).toEqual(sessionMigrations.migrate(initialSession()));
    });

    it('does not re-run applied steps when a wrapper already holds latest children', () => {
      const latestSession = sessionBlueprintMigrations.migrate(initialSessionBlueprint());
      const result = programBlueprintMigrations.migrate({
        version: 3,
        name: 'PPL',
        lastEdited: date('2024-01-01'),
        sessions: [latestSession],
      });
      expect(result.sessions[0]).toEqual(latestSession);
    });
  });

  describe('untrusted / future-version data', () => {
    it('rejects a session from a newer app version', () => {
      expect(() => sessionMigrations.migrate({ ...initialSession(), version: 9 } as never)).toThrow();
    });

    it('rejects a feed event whose own version is from the future', () => {
      expect(() => sessionUserEventMigrations.migrate({ ...initialSessionUserEvent(), version: 9 } as never)).toThrow();
    });

    it('rejects a feed event whose embedded session is from the future', () => {
      const event = initialSessionUserEvent();
      const poisoned = { ...event, session: { ...event.session, version: 9 } };
      expect(() => sessionUserEventMigrations.migrate(poisoned as never)).toThrow();
    });
  });

  describe('userEventMigrations union', () => {
    it('dispatches a SessionUserEvent and migrates its session', () => {
      const result = userEventMigrations.migrate(initialSessionUserEvent());
      expect(result.type).toBe('SessionUserEvent');
      if (result.type === 'SessionUserEvent') {
        expect(result.session.version).toBe(3);
      }
    });

    it('passes a RemovedSessionUserEvent through', () => {
      const removed: InitialRemovedSessionUserEventJSON = {
        type: 'RemovedSessionUserEvent',
        userId: 'u1',
        eventId: 'e1',
        timestamp: instant('2024-01-01T00:00:00Z'),
        expiry: instant('2024-04-01T00:00:00Z'),
        sessionId: 'session-1',
      };
      const result = removedSessionUserEventMigrations.migrate(removed);
      expect(result).toMatchObject({ type: 'RemovedSessionUserEvent', sessionId: 'session-1' });
    });
  });

  describe('edge cases', () => {
    it('migrates a program with no sessions', () => {
      const result = programBlueprintMigrations.migrate({
        name: 'Empty',
        lastEdited: date('2024-01-01'),
        sessions: [],
      });
      expect(result).toEqual({ version: 3, name: 'Empty', lastEdited: '2024-01-01', sessions: [] });
    });

    it('migrates a session with no recorded exercises', () => {
      const result = sessionMigrations.migrate({ ...initialSession(), recordedExercises: [] });
      expect(result.version).toBe(3);
      expect(result.recordedExercises).toEqual([]);
      expect(result.blueprint).toEqual({ name: 'Push Day', notes: 'session notes' });
    });
  });
});

function initialSessionUserEvent(): InitialSessionUserEventJSON {
  return {
    type: 'SessionUserEvent',
    userId: 'u1',
    eventId: 'e1',
    timestamp: instant('2024-01-01T00:00:00Z'),
    expiry: instant('2024-04-01T00:00:00Z'),
    session: initialSession(),
  };
}

function initialFollowedFeedUser(currentPlan: InitialProgramBlueprintJSON | undefined): InitialFollowedFeedUserJSON {
  return {
    type: 'FollowedFeedUser',
    id: 'user-1',
    publicKey: 'public-key' as unknown as RsaPublicKeyJSON,
    name: 'Bob',
    currentPlan,
    aesKey: 'aes-key' as unknown as AesKeyJSON,
    followSecret: 'secret',
  };
}
