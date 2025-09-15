import { google, LiftLog } from '@/gen/proto';
import {
  SessionBlueprint,
  WeightedExerciseBlueprint,
  Rest,
  ProgramBlueprint,
  ExerciseBlueprint,
  CardioExerciseBlueprint,
  CardioTarget,
  WeightedExerciseBlueprintPOJO,
  CardioExerciseBlueprintPOJO,
} from '@/models/blueprint-models';
import {
  PotentialSet,
  RecordedWeightedExercise,
  RecordedSet,
  Session,
  RecordedExercise,
  RecordedCardioExercise,
} from '@/models/session-models';
import Long from 'long';
import {
  FeedIdentity,
  FeedItem,
  FeedUser,
  FollowRequest,
  FollowRequestPOJO,
  SessionFeedItem,
  SharedItem,
  SharedProgramBlueprint,
} from '@/models/feed-models';
import {
  Duration,
  Instant,
  LocalDate,
  LocalDateTime,
  LocalTime,
} from '@js-joda/core';
import BigNumber from 'bignumber.js';
import { UuidConversionError } from '@/models/storage/uuid-conversion-error';
import { FeedState } from '@/store/feed';
import { RemoteData } from '@/models/remote';
import { uuidStringify } from '@/utils/uuid';

// Converts a UUID DAO to a string
export function fromUuidDao(
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

export function fromDateOnlyDao(
  dao: LiftLog.Ui.Models.IDateOnlyDao | null | undefined,
): LocalDate {
  if (!dao) {
    throw new Error('DateOnlyDao cannot be null');
  }
  return LocalDate.of(dao.year!, dao.month!, dao.day!);
}

function fromDateTimeDao(
  dao: LiftLog.Ui.Models.IDateTimeDao | null | undefined,
): LocalDateTime | undefined {
  if (!dao) {
    return undefined;
  }
  return fromDateOnlyDao(dao.date).atTime(fromTimeOnlyDao(dao.time));
}

export function fromTimestampDao(
  dao: google.protobuf.ITimestamp | null | undefined,
): Instant {
  // TODO - we just drop the nanos for now
  const sec = dao?.seconds;
  if (typeof sec === 'number') {
    return Instant.ofEpochSecond(sec);
  }
  return Instant.ofEpochSecond(dao!.seconds!.toNumber());
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
  if (dao.type === LiftLog.Ui.Models.SessionBlueprintDao.ExerciseType.CARDIO) {
    return RecordedCardioExercise.fromPOJO({
      notes: dao.notes?.value ?? undefined,
      blueprint: fromExerciseBlueprintDao(
        dao.exerciseBlueprint,
      ).toPOJO() as CardioExerciseBlueprintPOJO,
      actualDistance: fromDecimalDao(dao.actualDistance),
      avgHeartRate: fromDecimalDao(dao.avgHeartRate),
      actualTime: fromDurationDao(dao.actualTime),
      startedAt: fromDateTimeDao(dao.startedAt),
      completionDateTime: fromDateTimeDao(dao.completionDateTime),
      incline: fromDecimalDao(dao.incline),
      resistance: fromDecimalDao(dao.resistance),
    });
  }
  return RecordedWeightedExercise.fromPOJO({
    notes: dao.notes?.value ?? undefined,
    blueprint: fromExerciseBlueprintDao(
      dao.exerciseBlueprint,
    ).toPOJO() as WeightedExerciseBlueprintPOJO,
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

export function fromExerciseBlueprintDao(
  dao:
    | LiftLog.Ui.Models.SessionBlueprintDao.IExerciseBlueprintDaoV2
    | null
    | undefined,
): ExerciseBlueprint {
  if (!dao) {
    throw new Error('ExerciseBlueprint dao should not be null');
  }
  if (dao.type === LiftLog.Ui.Models.SessionBlueprintDao.ExerciseType.CARDIO) {
    return new CardioExerciseBlueprint(
      dao.name!,
      fromCardioTargetDao(dao.cardioTarget!),
      dao.notes ?? '',
      dao.link ?? '',
    );
  }
  return new WeightedExerciseBlueprint(
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

function fromCardioTargetDao(
  dao: LiftLog.Ui.Models.SessionBlueprintDao.ICardioTarget,
): CardioTarget {
  return {
    type: dao.type as 'distance' | 'time',
    value:
      dao.type === 'distance'
        ? fromDecimalDao(dao.distanceValue)
        : fromDurationDao(dao.timeValue)!,
  } as CardioTarget;
}

export function fromRestDao(
  dao: LiftLog.Ui.Models.SessionBlueprintDao.IRestDaoV2,
): Rest {
  return {
    minRest: fromDurationDao(dao.minRest)!,
    maxRest: fromDurationDao(dao.maxRest)!,
    failureRest: fromDurationDao(dao.failureRest)!,
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

export function fromFeedStateDao(dao: LiftLog.Ui.Models.IFeedStateDaoV1) {
  return {
    feed: dao.feedItems?.map(fromFeedItemDao).map((x) => x.toPOJO()) ?? [],
    followedUsers:
      (dao.followedUsers &&
        Object.fromEntries(
          dao.followedUsers
            .map(fromFeedUserDao)
            .map((x) => [x.id, x.toPOJO()] as const),
        )) ??
      {},
    identity:
      (dao.identity &&
        RemoteData.success(fromFeedIdentityDao(dao.identity).toPOJO())) ??
      RemoteData.notAsked(),
    followRequests: dao.followRequests?.map(fromFollowRequestDao) ?? [],
    followers:
      (dao.followers &&
        Object.fromEntries(
          dao.followers
            .map(fromFeedUserDao)
            .map((x) => [x.id, x.toPOJO()] as const),
        )) ??
      {},
    unpublishedSessionIds: dao.unpublishedSessionIds?.map(fromUuidDao) ?? [],
  } satisfies Partial<FeedState>;
}

export function fromDurationDao(
  duration: google.protobuf.IDuration | null | undefined,
) {
  if (!duration) {
    return undefined;
  }
  return Duration.ofSeconds(
    Long.fromValue(duration.seconds!).toNumber(),
  ).plusNanos(Long.fromValue(duration.nanos!).toNumber());
}

export function fromFeedItemDao(
  dao: LiftLog.Ui.Models.IFeedItemDaoV1,
): FeedItem {
  return new SessionFeedItem(
    fromUuidDao(dao.userId),
    fromUuidDao(dao.eventId),
    fromTimestampDao(dao.timestamp),
    fromTimestampDao(dao.timestamp),
    fromSessionDao(dao.session),
  );
}

// Converts a FeedIdentity DAO to a FeedIdentity
export function fromFeedIdentityDao(
  dao: LiftLog.Ui.Models.IFeedIdentityDaoV1,
): FeedIdentity {
  return new FeedIdentity(
    fromUuidDao(dao.id),
    dao.lookup?.value ?? '',
    { value: Uint8Array.from(dao.aesKey!) },
    {
      publicKey: { spkiPublicKeyBytes: Uint8Array.from(dao.publicKey!) },
      privateKey: { pkcs8PrivateKeyBytes: Uint8Array.from(dao.privateKey!) },
    },
    dao.password!,
    dao.name?.value ?? undefined,
    (dao.profilePicture && Uint8Array.from(dao.profilePicture)) ?? undefined,
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
    fromUuidDao(dao.id),
    { spkiPublicKeyBytes: Uint8Array.from(dao.publicKey!) },
    dao.name?.value ?? undefined,
    dao.nickname?.value ?? undefined,
    dao.currentPlan ? fromCurrentPlanDao(dao.currentPlan) : [],
    (dao.profilePicture && Uint8Array.from(dao.profilePicture)) ?? undefined,
    dao.aesKey?.length ? { value: Uint8Array.from(dao.aesKey) } : undefined,
    dao.followSecret?.value ?? undefined,
  );
}

// Converts a CurrentPlan DAO to a CurrentPlan
export function fromCurrentPlanDao(
  dao: LiftLog.Ui.Models.ICurrentPlanDaoV1,
): SessionBlueprint[] {
  return dao.sessions!.map(fromSessionBlueprintDao);
}

export function fromCurrentSessionDao(
  dao: LiftLog.Ui.Models.CurrentSessionStateDao.ICurrentSessionStateDaoV2,
) {
  return {
    latestSetTimerNotificationId:
      (dao.latestSetTimerNotificationId &&
        fromUuidDao(dao.latestSetTimerNotificationId)) ??
      undefined,
    workoutSession: dao.workoutSession && fromSessionDao(dao.workoutSession),
    historySession: dao.historySession && fromSessionDao(dao.historySession),
  };
}

export function fromSharedItemDao(
  dao: LiftLog.Ui.Models.SharedItemPayload,
): SharedItem | null {
  if (dao.sharedProgramBlueprint?.programBlueprint) {
    return new SharedProgramBlueprint(
      fromProgramBlueprintDao(dao.sharedProgramBlueprint.programBlueprint),
    );
  }
  return null;
}
function fromFollowRequestDao(
  value: LiftLog.Ui.Models.IInboxMessageDao,
): FollowRequestPOJO {
  return FollowRequest.fromPOJO({
    name: value.followRequest?.name?.value ?? '',
    userId: fromUuidDao(value.fromUserId),
  }).toPOJO();
}
