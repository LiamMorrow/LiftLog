import { LiftLog } from '@/gen/proto';
import {
  CardioExerciseBlueprintJSON,
  CardioExerciseSetBlueprintJSON,
  CardioTargetJSON,
  DistanceUnitJSON,
  ExerciseBlueprintJSON,
  ProgramBlueprintJSON,
  RestJSON,
  SessionBlueprintJSON,
  WeightedExerciseBlueprintJSON,
} from './blueprint';
import { google } from '@/gen/proto';
import { uuidStringify } from '@/utils/uuid';
import Long from 'long';
import { UuidConversionError } from './uuid-conversion-error';
import {
  Duration,
  LocalDate,
  LocalTime,
  OffsetDateTime,
  ZoneOffset,
} from '@js-joda/core';
import BigNumber from 'bignumber.js';
import {
  toBigNumberJSON,
  toDurationJSON,
  toLocalDateJSON,
  toOffsetDateTimeJSON,
} from '../libs';
import { match, P } from 'ts-pattern';
import {
  PotentialSetJSON,
  RecordedCardioExerciseJSON,
  RecordedCardioExerciseSetJSON,
  RecordedExerciseJSON,
  RecordedSetJSON,
  RecordedWeightedExerciseJSON,
  SessionJSON,
} from './session';
import { WeightJSON, WeightUnitJSON } from './weight';

export class ProtobufToJsonV1Migrator {
  static migrateProgramBlueprint(
    value: LiftLog.Ui.Models.ProgramBlueprintDao.IProgramBlueprintDaoV1,
  ): ProgramBlueprintJSON {
    return fromProgramBlueprint(value);
  }

  static migrateSession(
    value: LiftLog.Ui.Models.SessionHistoryDao.ISessionDaoV2,
  ): SessionJSON {
    return fromSessionDao(value);
  }

  static migrateSessionBlueprint(
    value: LiftLog.Ui.Models.SessionBlueprintDao.ISessionBlueprintDaoV2,
  ): SessionBlueprintJSON {
    return fromSessionBlueprintDao(value);
  }
}

function fromUuidDao(
  dao: LiftLog.Ui.Models.IUuidDao | null | undefined,
): string {
  if (!dao?.value) {
    throw new Error('UUID dao cannot be null');
  }
  const v = dao.value;
  // This is wild. We used Guid.toByteArray in c# originally. You'd think this would just keep the same order as when the bytes are printed as hex as a string, but no. From the docs:
  // Note that the order of bytes in the returned byte array is different from the string representation of a Guid value.
  // The order of the beginning four-byte group and the next two two-byte groups is reversed, whereas the order of the last two-byte group and the closing six-byte group is the same.
  //    Guid: 35918bc9-196d-40ea-9779-889d79b753f0
  //    C9 8B 91 35 6D 19 EA 40 97 79 88 9D 79 B7 53 F0
  //    Guid: 35918bc9-196d-40ea-9779-889d79b753f0 (Same as First Guid: True)
  // source: https://learn.microsoft.com/en-us/dotnet/api/system.guid.tobytearray?view=net-9.0
  // prettier-ignore
  const reorderedForGuid = [
    v[3], v[2], v[1], v[0],
    v[5], v[4],
    v[7], v[6],
    v[8],v[9],v[10],v[11],v[12],v[13],v[14],v[15]
  ];
  try {
    return uuidStringify(Uint8Array.from(reorderedForGuid));
  } catch (e) {
    throw new UuidConversionError(dao.value, { cause: e });
  }
}

const nanoFactor = BigNumber('1000000000');

// Converts a DecimalValue DAO to a BigNumber
function fromDecimalDao(dao: LiftLog.Ui.Models.IDecimalValue): BigNumber;
function fromDecimalDao(
  dao: LiftLog.Ui.Models.IDecimalValue | null | undefined,
): BigNumber | undefined;
function fromDecimalDao(
  dao: LiftLog.Ui.Models.IDecimalValue | null | undefined,
): BigNumber | undefined {
  if (dao?.nanos == null || dao?.units == null) {
    return undefined;
  }
  return BigNumber(dao.units.toString()).plus(
    BigNumber(dao.nanos).div(nanoFactor),
  );
}

function fromTimeOnlyDao(
  dao: LiftLog.Ui.Models.ITimeOnlyDao | null | undefined,
): LocalTime {
  if (!dao) {
    throw new Error('TimeOnlyDao cannot be null');
  }
  const milli = dao.millisecond;
  const micro = dao.microsecond;
  const nano = (micro ?? 0) * 1000 + (milli ?? 0) * 1000000;
  return LocalTime.of(dao.hour!, dao.minute!, dao.second!, nano);
}

function fromDateOnlyDao(
  dao: LiftLog.Ui.Models.IDateOnlyDao | null | undefined,
): LocalDate {
  if (!dao) {
    throw new Error('DateOnlyDao cannot be null');
  }
  return LocalDate.of(dao.year!, dao.month!, dao.day!);
}

function fromDateTimeDao(
  dao: LiftLog.Ui.Models.IDateTimeDao | null | undefined,
): OffsetDateTime | undefined {
  if (!dao) {
    return undefined;
  }
  const localDateTime = fromDateOnlyDao(dao.date).atTime(
    fromTimeOnlyDao(dao.time),
  );
  return localDateTime.atOffset(
    dao.offset
      ? ZoneOffset.ofTotalSeconds(dao.offset.totalSeconds!)
      : ZoneOffset.systemDefault().rules().offsetOfLocalDateTime(localDateTime),
  );
}

function fromDurationDao(
  duration: google.protobuf.IDuration | null | undefined,
) {
  if (!duration) {
    return undefined;
  }
  return Duration.ofSeconds(
    Long.fromValue(duration.seconds!).toNumber(),
  ).plusNanos(Long.fromValue(duration.nanos!).toNumber());
}

function fromProgramBlueprint(
  dao: LiftLog.Ui.Models.ProgramBlueprintDao.IProgramBlueprintDaoV1,
): ProgramBlueprintJSON {
  return {
    name: dao.name ?? '',
    sessions: dao.sessions!.map((x) => fromSessionBlueprintDao(x)),
    lastEdited: toLocalDateJSON(
      dao.lastEdited ? fromDateOnlyDao(dao.lastEdited) : LocalDate.now(),
    ),
  };
}

function fromSessionBlueprintDao(
  dao: LiftLog.Ui.Models.SessionBlueprintDao.ISessionBlueprintDaoV2,
): SessionBlueprintJSON {
  return {
    name: dao.name ?? '',
    exercises: (dao.exerciseBlueprints ?? []).map((x) =>
      fromExerciseBlueprintDao(x),
    ),
    notes: dao.notes ?? '',
  };
}

function fromExerciseBlueprintDao(
  dao:
    | LiftLog.Ui.Models.SessionBlueprintDao.IExerciseBlueprintDaoV2
    | null
    | undefined,
): ExerciseBlueprintJSON {
  if (!dao) {
    throw new Error('ExerciseBlueprint dao should not be null');
  }
  if (dao.type === LiftLog.Ui.Models.SessionBlueprintDao.ExerciseType.CARDIO) {
    return fromCardioExerciseBlueprintDao(dao);
  }
  return fromWeightedExerciseBlueprintDao(dao);
}

function fromCardioExerciseBlueprintDao(
  dao: LiftLog.Ui.Models.SessionBlueprintDao.IExerciseBlueprintDaoV2,
): CardioExerciseBlueprintJSON {
  const sets = dao.cardioSets!.map((x) => fromCardioExerciseSetBlueprintDao(x));
  return {
    type: 'CardioExerciseBlueprint',
    name: dao.name!,
    sets:
      sets.length === 0
        ? [getCardioBlueprintSetFromDeprecatedFields(dao)]
        : sets,
    notes: dao.notes ?? '',
    link: dao.link ?? '',
  };
}

function getCardioBlueprintSetFromDeprecatedFields(
  dao: LiftLog.Ui.Models.SessionBlueprintDao.IExerciseBlueprintDaoV2,
): CardioExerciseSetBlueprintJSON {
  return {
    target: fromCardioTargetDao(dao.deprecatedCardioTarget),
    trackDuration: dao.deprecatedTrackDuration ?? false,
    trackDistance: dao.deprecatedTrackDistance ?? false,
    trackResistance: dao.deprecatedTrackResistance ?? false,
    trackIncline: dao.deprecatedTrackIncline ?? false,
    trackWeight: false,
    trackSteps: false,
  };
}

function fromCardioExerciseSetBlueprintDao(
  dao: LiftLog.Ui.Models.SessionBlueprintDao.ICardioExerciseSetBlueprintDao,
): CardioExerciseSetBlueprintJSON {
  return {
    target: fromCardioTargetDao(dao.cardioTarget),
    trackDuration: dao.trackDuration ?? false,
    trackDistance: dao.trackDistance ?? false,
    trackResistance: dao.trackResistance ?? false,
    trackIncline: dao.trackIncline ?? false,
    trackWeight: dao.trackWeight ?? false,
    trackSteps: dao.trackSteps ?? false,
  };
}

function fromCardioTargetDao(
  dao: LiftLog.Ui.Models.SessionBlueprintDao.ICardioTarget | null | undefined,
): CardioTargetJSON {
  if (!dao) {
    throw new Error('Expected a non null cardio target');
  }
  return match(dao.type as CardioTargetJSON['type'])
    .returnType<CardioTargetJSON>()
    .with('distance', () => ({
      type: 'distance',
      value: {
        value: toBigNumberJSON(
          fromDecimalDao(dao.distanceValue) ?? BigNumber(0),
        ),
        unit: (dao.distanceUnit as DistanceUnitJSON) ?? 'metre',
      },
    }))
    .with('time', () => ({
      type: 'time',
      value: toDurationJSON(fromDurationDao(dao.timeValue) ?? Duration.ZERO),
    }))
    .exhaustive();
}

function fromWeightedExerciseBlueprintDao(
  dao: LiftLog.Ui.Models.SessionBlueprintDao.IExerciseBlueprintDaoV2,
): WeightedExerciseBlueprintJSON {
  return {
    type: 'WeightedExerciseBlueprint',
    name: dao.name!,
    sets: dao.sets!,
    repsPerSet: dao.repsPerSet!,
    weightIncreaseOnSuccess: toBigNumberJSON(
      fromDecimalDao(dao.weightIncreaseOnSuccess) ?? BigNumber('0'),
    ),
    restBetweenSets: fromRestDao(dao.restBetweenSets),
    supersetWithNext: dao.supersetWithNext ?? false,
    notes: dao.notes ?? '',
    link: dao.link ?? '',
  };
}

function fromRestDao(
  dao: LiftLog.Ui.Models.SessionBlueprintDao.IRestDaoV2 | null | undefined,
): RestJSON {
  return {
    minRest: toDurationJSON(fromDurationDao(dao?.minRest) ?? Duration.ZERO),
    maxRest: toDurationJSON(fromDurationDao(dao?.maxRest) ?? Duration.ZERO),
    failureRest: toDurationJSON(
      fromDurationDao(dao?.failureRest) ?? Duration.ZERO,
    ),
  };
}

function fromSessionDao(
  dao: LiftLog.Ui.Models.SessionHistoryDao.ISessionDaoV2 | null | undefined,
): SessionJSON {
  if (!dao) {
    throw new Error('Session dao cannot be null');
  }
  const recordedExercises =
    dao.recordedExercises?.map((x) => fromRecordedExerciseDao(dao.date!, x)) ??
    [];
  return {
    id: fromUuidDao(dao.id),
    blueprint: {
      name: dao.sessionName!,
      exercises: recordedExercises.map((x) => x.blueprint),
      notes: dao.blueprintNotes ?? '',
    },
    bodyweight: dao.bodyweightValue
      ? {
          value: toBigNumberJSON(fromDecimalDao(dao.bodyweightValue)),
          unit: fromWeightUnitDao(dao.bodyweightUnit),
        }
      : undefined,
    date: toLocalDateJSON(fromDateOnlyDao(dao.date)),
    recordedExercises,
  };
}

export function fromRecordedExerciseDao(
  sessionDate: LiftLog.Ui.Models.IDateOnlyDao,
  dao:
    | LiftLog.Ui.Models.SessionHistoryDao.IRecordedExerciseDaoV2
    | null
    | undefined,
): RecordedExerciseJSON {
  if (!dao) {
    throw new Error('Recorded exercise DAO cannot be null');
  }
  if (dao.type === LiftLog.Ui.Models.SessionBlueprintDao.ExerciseType.CARDIO) {
    return fromRecordedCardioExerciseDao(dao);
  }
  return fromRecordedWeightedExerciseDao(sessionDate, dao);
}

function fromRecordedCardioExerciseSetDao(
  dao: LiftLog.Ui.Models.SessionHistoryDao.IRecordedCardioExerciseSetDao,
): RecordedCardioExerciseSetJSON {
  return {
    blueprint: fromCardioExerciseSetBlueprintDao(dao.blueprint!),
    distance:
      dao.distanceValue && dao.distanceUnit
        ? {
            value: toBigNumberJSON(fromDecimalDao(dao.distanceValue)),
            unit: dao.distanceUnit.value as DistanceUnitJSON,
          }
        : undefined,
    duration: dao.duration
      ? toDurationJSON(fromDurationDao(dao.duration)!)
      : undefined,
    completionDateTime: dao.completionDateTime
      ? toOffsetDateTimeJSON(fromDateTimeDao(dao.completionDateTime)!)
      : undefined,
    incline: dao.incline
      ? toBigNumberJSON(fromDecimalDao(dao.incline))
      : undefined,
    resistance: dao.resistance
      ? toBigNumberJSON(fromDecimalDao(dao.resistance))
      : undefined,
    weight: dao.weight ? fromWeightDao(dao.weight) : undefined,
    steps: dao.steps?.value ?? undefined,
  };
}

function fromRecordedCardioExerciseDao(
  dao: LiftLog.Ui.Models.SessionHistoryDao.IRecordedExerciseDaoV2,
): RecordedCardioExerciseJSON {
  const sets = dao.cardioSets!.map((x) => fromRecordedCardioExerciseSetDao(x));
  return {
    type: 'RecordedCardioExercise',
    notes: dao.notes?.value ?? undefined,
    blueprint: fromCardioExerciseBlueprintDao(dao.exerciseBlueprint!),
    sets:
      sets.length === 0
        ? [getRecordedCardioSetFromDeprecatedFields(dao)]
        : sets,
  };
}

function fromRecordedWeightedExerciseDao(
  sessionDate: LiftLog.Ui.Models.IDateOnlyDao,
  dao: LiftLog.Ui.Models.SessionHistoryDao.IRecordedExerciseDaoV2,
): RecordedWeightedExerciseJSON {
  return {
    type: 'RecordedWeightedExercise',
    notes: dao.notes?.value ?? undefined,
    blueprint: fromWeightedExerciseBlueprintDao(dao.exerciseBlueprint!),
    potentialSets: dao.potentialSets!.map((x) =>
      fromPotentialSetDao(sessionDate, x),
    ),
  };
}

function fromRecordedSetDao(
  sessionDate: LiftLog.Ui.Models.IDateOnlyDao,
  recordedSetDao: LiftLog.Ui.Models.SessionHistoryDao.IRecordedSetDaoV2,
): RecordedSetJSON {
  const dateCompleted = recordedSetDao.completionDate ?? sessionDate;
  const completionLocalDateTime = fromDateOnlyDao(dateCompleted).atTime(
    fromTimeOnlyDao(recordedSetDao.completionTime),
  );
  const completionDateTime = toOffsetDateTimeJSON(
    completionLocalDateTime.atOffset(
      recordedSetDao.completionOffset
        ? ZoneOffset.ofTotalSeconds(
            recordedSetDao.completionOffset.totalSeconds!,
          )
        : ZoneOffset.systemDefault()
            .rules()
            .offsetOfLocalDateTime(completionLocalDateTime),
    ),
  );

  return {
    completionDateTime,
    repsCompleted: recordedSetDao.repsCompleted!,
  };
}
function fromPotentialSetDao(
  sessionDate: LiftLog.Ui.Models.IDateOnlyDao,
  dao:
    | LiftLog.Ui.Models.SessionHistoryDao.IPotentialSetDaoV2
    | null
    | undefined,
): PotentialSetJSON {
  if (!dao) {
    throw new Error('PotentialSetDao cannot be null');
  }
  return {
    set: dao.recordedSet
      ? fromRecordedSetDao(sessionDate, dao.recordedSet)
      : undefined,
    weight: {
      value: toBigNumberJSON(fromDecimalDao(dao.weightValue) ?? BigNumber(0)),
      unit: fromWeightUnitDao(dao.weightUnit),
    },
  };
}
function getRecordedCardioSetFromDeprecatedFields(
  dao: LiftLog.Ui.Models.SessionHistoryDao.IRecordedExerciseDaoV2,
): RecordedCardioExerciseSetJSON {
  return {
    blueprint: getCardioBlueprintSetFromDeprecatedFields(
      dao.exerciseBlueprint!,
    ),
    distance:
      dao.deprecatedDistanceValue && dao.deprecatedDistanceUnit
        ? {
            value: toBigNumberJSON(fromDecimalDao(dao.deprecatedDistanceValue)),
            unit: dao.deprecatedDistanceUnit.value as DistanceUnitJSON,
          }
        : undefined,
    duration: dao.deprecatedDuration
      ? toDurationJSON(fromDurationDao(dao.deprecatedDuration)!)
      : undefined,
    completionDateTime: dao.deprecatedCompletionDateTime
      ? toOffsetDateTimeJSON(fromDateTimeDao(dao.deprecatedCompletionDateTime)!)
      : undefined,
    incline: dao.deprecatedIncline
      ? toBigNumberJSON(fromDecimalDao(dao.deprecatedIncline))
      : undefined,
    resistance: dao.deprecatedResistance
      ? toBigNumberJSON(fromDecimalDao(dao.deprecatedResistance))
      : undefined,
    weight: undefined,
    steps: undefined,
  };
}

export function fromWeightUnitDao(
  daoUnit: LiftLog.Ui.Models.WeightUnit | null | undefined,
): WeightUnitJSON {
  return match(daoUnit)
    .returnType<WeightUnitJSON>()
    .with(P.nullish, () => 'nil')
    .with(LiftLog.Ui.Models.WeightUnit.NIL satisfies 0 as 0, () => 'nil')
    .with(
      LiftLog.Ui.Models.WeightUnit.KILOGRAMS satisfies 1 as 1,
      () => 'kilograms',
    )
    .with(LiftLog.Ui.Models.WeightUnit.POUNDS satisfies 2 as 2, () => 'pounds')
    .exhaustive();
}
function fromWeightDao(value: LiftLog.Ui.Models.IWeight): WeightJSON {
  return {
    value: toBigNumberJSON(fromDecimalDao(value.value!)),
    unit: fromWeightUnitDao(value.unit),
  };
}
