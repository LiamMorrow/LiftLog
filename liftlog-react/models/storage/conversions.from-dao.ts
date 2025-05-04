import { LiftLog } from '@/gen/proto';
import {
  SessionBlueprint,
  ExerciseBlueprint,
  Rest,
  ProgramBlueprint,
} from '@/models/session-models';
import {
  PotentialSet,
  RecordedExercise,
  RecordedSet,
  Session,
} from '@/models/session-models';
import Long from 'long';
import { FeedIdentity, FeedUser } from '@/models/feed-models';
import { Duration, LocalDate, LocalTime } from '@js-joda/core';
import BigNumber from 'bignumber.js';
import { stringify as uuidStringify } from 'uuid';
import { UuidConversionError } from '@/models/storage/uuid-conversion-error';

// Converts a UUID DAO to a string
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
export function fromDecimalDao(
  dao: LiftLog.Ui.Models.IDecimalValue | null | undefined,
): BigNumber {
  if (dao?.nanos == null || dao?.units == null) {
    throw new Error('DecimalDao cannot be null');
  }
  return BigNumber(dao.units.toString()).plus(
    BigNumber(dao.nanos).div(nanoFactor),
  );
}

// Converts a TimeOnly DAO to a LocalTime
export function fromTimeOnlyDao(
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

// Converts a DateOnly DAO to a LocalDate
export function fromDateOnlyDao(
  dao: LiftLog.Ui.Models.IDateOnlyDao | null | undefined,
): LocalDate {
  if (!dao) {
    throw new Error('DateOnlyDao cannot be null');
  }
  return LocalDate.of(dao.year!, dao.month!, dao.day!);
}

// Converts a RecordedSet DAO to a RecordedSetPOJO
export function fromRecordedSetDao(
  sessionDate: LiftLog.Ui.Models.IDateOnlyDao,
  recordedSetDao: LiftLog.Ui.Models.SessionHistoryDao.IRecordedSetDaoV2,
): RecordedSet {
  const dateCompleted = recordedSetDao.completionDate ?? sessionDate;

  return RecordedSet.fromPOJO({
    completionDateTime: fromDateOnlyDao(dateCompleted).atTime(
      fromTimeOnlyDao(recordedSetDao.completionTime),
    ),
    repsCompleted: recordedSetDao.repsCompleted!,
  });
}

// Converts a PotentialSet DAO to a PotentialSetPOJO
function fromPotentialSetDao(
  sessionDate: LiftLog.Ui.Models.IDateOnlyDao,
  dao:
    | LiftLog.Ui.Models.SessionHistoryDao.IPotentialSetDaoV2
    | null
    | undefined,
): PotentialSet {
  if (!dao) {
    throw new Error('PotentialSetDao cannot be null');
  }
  return PotentialSet.fromPOJO({
    set: dao.recordedSet
      ? fromRecordedSetDao(sessionDate, dao.recordedSet).toPOJO()
      : undefined,
    weight: fromDecimalDao(dao.weight),
  });
}

// Converts a RecordedExercise DAO to a RecordedExercisePOJO
function fromRecordedExerciseDao(
  sessionDate: LiftLog.Ui.Models.IDateOnlyDao,
  dao:
    | LiftLog.Ui.Models.SessionHistoryDao.IRecordedExerciseDaoV2
    | null
    | undefined,
): RecordedExercise {
  if (!dao) {
    throw new Error('Recorded exercise DAO cannot be null');
  }
  return RecordedExercise.fromPOJO({
    notes: dao.notes?.value ?? undefined,
    blueprint: fromExerciseBlueprintDao(dao.exerciseBlueprint).toPOJO(),
    perSetWeight: dao.perSetWeight!,
    potentialSets: dao.potentialSets!.map((x) =>
      fromPotentialSetDao(sessionDate, x).toPOJO(),
    ),
  });
}

// Converts a Session DAO to a SessionPOJO
export function fromSessionDao(
  dao: LiftLog.Ui.Models.SessionHistoryDao.ISessionDaoV2 | null | undefined,
): Session {
  if (!dao) {
    throw new Error('Session dao cannot be null');
  }
  const recordedExercises =
    dao.recordedExercises?.map((x) =>
      fromRecordedExerciseDao(dao.date!, x).toPOJO(),
    ) ?? [];
  return Session.fromPOJO({
    id: fromUuidDao(dao.id),
    blueprint: SessionBlueprint.fromPOJO({
      name: dao.sessionName!,
      exercises: recordedExercises.map((x) => x.blueprint),
      notes: dao.blueprintNotes ?? '',
    }).toPOJO(),
    bodyweight: dao.bodyweight ? fromDecimalDao(dao.bodyweight) : undefined,
    date: fromDateOnlyDao(dao.date),
    recordedExercises,
  });
}

// Converts a SessionHistory DAO to a Map of Sessions
export function fromSessionHistoryDao(
  sessionHistoryModel: LiftLog.Ui.Models.SessionHistoryDao.SessionHistoryDaoV2,
): Map<string, Session> {
  return sessionHistoryModel.completedSessions.reduce((map, item) => {
    map.set(
      fromUuidDao(item.id),
      Session.fromPOJO(fromSessionDao(item).toPOJO()),
    );
    return map;
  }, new Map<string, Session>());
}

// Converts a SessionBlueprint DAO to a SessionBlueprint
export function fromSessionBlueprintDao(
  dao: LiftLog.Ui.Models.SessionBlueprintDao.ISessionBlueprintDaoV2,
): SessionBlueprint {
  return new SessionBlueprint(
    dao.name!,
    dao.exerciseBlueprints!.map(fromExerciseBlueprintDao),
    dao.notes ?? '',
  );
}

// Converts an ExerciseBlueprint DAO to an ExerciseBlueprint
export function fromExerciseBlueprintDao(
  dao:
    | LiftLog.Ui.Models.SessionBlueprintDao.IExerciseBlueprintDaoV2
    | null
    | undefined,
): ExerciseBlueprint {
  if (!dao) {
    throw new Error('ExerciseBlueprint dao should not be null');
  }
  return new ExerciseBlueprint(
    dao.name!,
    dao.sets!,
    dao.repsPerSet!,
    fromDecimalDao(dao.weightIncreaseOnSuccess),
    fromRestDao(dao.restBetweenSets!),
    dao.supersetWithNext ?? false,
    dao.notes ?? '',
    dao.link ?? '',
  );
}

// Converts a Rest DAO to a Rest model
export function fromRestDao(
  dao: LiftLog.Ui.Models.SessionBlueprintDao.IRestDaoV2,
): Rest {
  return {
    minRest: Duration.ofSeconds(
      Long.fromValue(dao.minRest!.seconds!).toNumber(),
    ),
    maxRest: Duration.ofSeconds(
      Long.fromValue(dao.maxRest!.seconds!).toNumber(),
    ),
    failureRest: Duration.ofSeconds(
      Long.fromValue(dao.failureRest!.seconds!).toNumber(),
    ),
  };
}

// Converts a ProgramBlueprint DAO to a ProgramBlueprint
export function fromProgramBlueprintDao(
  dao: LiftLog.Ui.Models.ProgramBlueprintDao.IProgramBlueprintDaoV1,
): ProgramBlueprint {
  return new ProgramBlueprint(
    dao.name!,
    dao.sessions!.map(fromSessionBlueprintDao),
    dao.lastEdited ? fromDateOnlyDao(dao.lastEdited) : LocalDate.now(),
  );
}

// Converts a FeedIdentity DAO to a FeedIdentity
export function fromFeedIdentityDao(
  dao: LiftLog.Ui.Models.IFeedIdentityDaoV1,
): FeedIdentity {
  return new FeedIdentity(
    fromUuidDao(dao.id!),
    dao.lookup?.value ?? '',
    { value: dao.aesKey! },
    {
      publicKey: { spkiPublicKeyBytes: dao.publicKey! },
      privateKey: { pkcs8PrivateKeyBytes: dao.privateKey! },
    },
    dao.password!,
    dao.name?.value ?? undefined,
    dao.profilePicture ?? undefined,
    dao.publishBodyweight ?? false,
    dao.publishPlan ?? false,
    dao.publishWorkouts ?? false,
  );
}

// Converts a FeedUser DAO to a FeedUser
export function fromFeedUserDao(
  dao: LiftLog.Ui.Models.IFeedUserDaoV1,
): FeedUser {
  return new FeedUser(
    fromUuidDao(dao.id!),
    { spkiPublicKeyBytes: dao.publicKey! },
    dao.name?.value ?? undefined,
    dao.nickname?.value ?? undefined,
    dao.currentPlan ? fromCurrentPlanDao(dao.currentPlan) : [],
    dao.profilePicture ?? undefined,
    dao.aesKey ? { value: dao.aesKey } : undefined,
    dao.followSecret?.value ?? undefined,
  );
}

// Converts a CurrentPlan DAO to a CurrentPlan
export function fromCurrentPlanDao(
  dao: LiftLog.Ui.Models.ICurrentPlanDaoV1,
): SessionBlueprint[] {
  return dao.sessions!.map(fromSessionBlueprintDao);
}
