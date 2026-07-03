import { describe, it, expect } from 'vitest';
import { parse as uuidParse } from 'uuid';
import { LiftLog } from '@/gen/proto';
import { ProtobufToJsonV1Migrator } from '@/models/storage/versions/initial/protobuf-migrator';
import { RecordedCardioExerciseJSON, RecordedWeightedExerciseJSON } from '@/models/storage/versions/initial/session';

// The C# `Guid.ToByteArray()` order differs from the standard string byte order:
// the first three groups are little-endian. Applying the same swap to the standard
// bytes reproduces the C# order (the permutation is its own inverse).
function toCsharpGuidBytes(uuidString: string): Uint8Array {
  const s = uuidParse(uuidString);
  return Uint8Array.from([
    s[3]!,
    s[2]!,
    s[1]!,
    s[0]!,
    s[5]!,
    s[4]!,
    s[7]!,
    s[6]!,
    s[8]!,
    s[9]!,
    s[10]!,
    s[11]!,
    s[12]!,
    s[13]!,
    s[14]!,
    s[15]!,
  ]);
}

function uuidDao(uuidString: string) {
  return { value: toCsharpGuidBytes(uuidString) };
}

// A protobuf DecimalValue: integer `units` plus fractional `nanos` (1e9 = 1.0).
function dec(value: number) {
  const units = Math.trunc(value);
  const nanos = Math.round((value - units) * 1_000_000_000);
  return { units, nanos };
}

function dateOnly(year: number, month: number, day: number) {
  return { year, month, day };
}

function timeOnly(hour: number, minute: number, second: number) {
  return { hour, minute, second, millisecond: 0, microsecond: 0 };
}

function duration(seconds: number) {
  return { seconds, nanos: 0 };
}

function restDao() {
  return { minRest: duration(120), maxRest: duration(180), failureRest: duration(300) };
}

describe('ProtobufToJsonV1Migrator.migrateUuid', () => {
  it('round-trips a GUID through the C# byte reordering', () => {
    const id = '35918bc9-196d-40ea-9779-889d79b753f0';
    expect(ProtobufToJsonV1Migrator.migrateUuid(uuidDao(id))).toBe(id);
  });

  it('throws when the dao is null', () => {
    expect(() => ProtobufToJsonV1Migrator.migrateUuid(undefined)).toThrow('UUID dao cannot be null');
  });
});

describe('ProtobufToJsonV1Migrator.migrateSession', () => {
  const sessionId = 'a1b2c3d4-e5f6-4071-8899-aabbccddeeff';

  function weightedSessionDao() {
    return {
      id: uuidDao(sessionId),
      sessionName: 'Leg Day',
      blueprintNotes: 'notes',
      bodyweightValue: dec(80),
      bodyweightUnit: LiftLog.Ui.Models.WeightUnit.KILOGRAMS,
      date: dateOnly(2025, 4, 5),
      recordedExercises: [
        {
          notes: { value: 'squat notes' },
          exerciseBlueprint: {
            name: 'Squat',
            sets: 3,
            repsPerSet: 10,
            weightIncreaseOnSuccess: dec(2.5),
            restBetweenSets: restDao(),
            supersetWithNext: false,
            notes: '',
            link: '',
          },
          potentialSets: [
            {
              recordedSet: {
                completionTime: timeOnly(10, 30, 0),
                repsCompleted: 10,
              },
              weightValue: dec(100),
              weightUnit: LiftLog.Ui.Models.WeightUnit.KILOGRAMS,
            },
            {
              weightValue: dec(60),
              weightUnit: LiftLog.Ui.Models.WeightUnit.POUNDS,
            },
          ],
        },
      ],
    };
  }

  it('migrates a weighted session with its blueprint and sets', () => {
    const result = ProtobufToJsonV1Migrator.migrateSession(
      weightedSessionDao() as unknown as LiftLog.Ui.Models.SessionHistoryDao.ISessionDaoV2,
    );

    expect(result.id).toBe(sessionId);
    expect(result.blueprint.name).toBe('Leg Day');
    expect(result.bodyweight?.unit).toBe('kilograms');

    const exercise = result.recordedExercises[0] as RecordedWeightedExerciseJSON;
    expect(exercise.type).toBe('RecordedWeightedExercise');
    expect(exercise.blueprint.sets).toBe(3);
    expect(exercise.potentialSets[0]!.set?.repsCompleted).toBe(10);
    expect(exercise.potentialSets[0]!.weight.unit).toBe('kilograms');
    expect(exercise.potentialSets[1]!.set).toBeUndefined();
    expect(exercise.potentialSets[1]!.weight.unit).toBe('pounds');
  });

  it('throws when the session dao is null', () => {
    expect(() => ProtobufToJsonV1Migrator.migrateSession(undefined as never)).toThrow('Session dao cannot be null');
  });
});

describe('ProtobufToJsonV1Migrator.migrateSessionBlueprint', () => {
  const cardioType = LiftLog.Ui.Models.SessionBlueprintDao.ExerciseType.CARDIO;

  function blueprintDao() {
    return {
      name: 'Mixed',
      notes: 'plan notes',
      exerciseBlueprints: [
        {
          name: 'Bench',
          sets: 5,
          repsPerSet: 5,
          weightIncreaseOnSuccess: dec(2.5),
          restBetweenSets: restDao(),
          supersetWithNext: true,
          notes: '',
          link: '',
        },
        {
          type: cardioType,
          name: 'Row',
          notes: '',
          link: '',
          cardioSets: [
            {
              cardioTarget: { type: 'time', timeValue: duration(600) },
              trackDuration: true,
              trackDistance: false,
              trackResistance: false,
              trackIncline: false,
              trackWeight: false,
              trackSteps: false,
            },
            {
              cardioTarget: { type: 'distance', distanceValue: dec(5), distanceUnit: 'kilometre' },
              trackDuration: false,
              trackDistance: true,
              trackResistance: false,
              trackIncline: false,
              trackWeight: false,
              trackSteps: false,
            },
          ],
        },
      ],
    };
  }

  it('migrates weighted and cardio exercises with both target types', () => {
    const result = ProtobufToJsonV1Migrator.migrateSessionBlueprint(
      blueprintDao() as unknown as LiftLog.Ui.Models.SessionBlueprintDao.ISessionBlueprintDaoV2,
    );

    expect(result.name).toBe('Mixed');
    expect(result.exercises[0]!.type).toBe('WeightedExerciseBlueprint');
    const cardio = result.exercises[1] as CardioExerciseBlueprintFromJSON;
    expect(cardio.type).toBe('CardioExerciseBlueprint');
    expect(cardio.sets[0]!.target.type).toBe('time');
    expect(cardio.sets[1]!.target.type).toBe('distance');
  });
});

// Local alias to avoid importing the full blueprint JSON union just for a cast.
type CardioExerciseBlueprintFromJSON = Extract<
  RecordedCardioExerciseJSON['blueprint'],
  { type: 'CardioExerciseBlueprint' }
>;

describe('ProtobufToJsonV1Migrator.migrateProgramBlueprint', () => {
  it('migrates each session and defaults an absent lastEdited', () => {
    const dao = {
      name: 'My Program',
      lastEdited: dateOnly(2025, 1, 2),
      sessions: [
        {
          name: 'Day 1',
          notes: '',
          exerciseBlueprints: [
            {
              name: 'Squat',
              sets: 3,
              repsPerSet: 10,
              weightIncreaseOnSuccess: dec(2.5),
              restBetweenSets: restDao(),
              supersetWithNext: false,
              notes: '',
              link: '',
            },
          ],
        },
      ],
    };

    const result = ProtobufToJsonV1Migrator.migrateProgramBlueprint(
      dao as unknown as LiftLog.Ui.Models.ProgramBlueprintDao.IProgramBlueprintDaoV1,
    );

    expect(result.name).toBe('My Program');
    expect(result.sessions).toHaveLength(1);
    expect(result.sessions[0]!.exercises[0]!.name).toBe('Squat');
  });
});
