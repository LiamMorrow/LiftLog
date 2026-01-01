import { google, LiftLog } from '@/gen/proto';
import {
  Duration,
  Instant,
  LocalDate,
  LocalTime,
  OffsetDateTime,
} from '@js-joda/core';
import BigNumber from 'bignumber.js';
import Long from 'long';
import {
  WeightedExerciseBlueprint,
  ProgramBlueprint,
  Rest,
  SessionBlueprint,
  ExerciseBlueprint,
  CardioTarget,
} from '@/models/blueprint-models';
import {
  FeedIdentity,
  FeedItem,
  FeedUser,
  FollowRequest,
  SessionFeedItem,
  SharedItem,
  SharedProgramBlueprint,
} from '@/models/feed-models';
import {
  SessionPOJO,
  PotentialSet,
  RecordedWeightedExercise,
  RecordedSet,
  Session,
  RecordedExercise,
} from '@/models/session-models';
import Enumerable from 'linq';
import { FeedState } from '@/store/feed';
import { uuidParse } from '@/utils/uuid';
import { Weight, WeightUnit } from '@/models/weight';
import { match } from 'ts-pattern';

export function toUuidDao(uuid: string): LiftLog.Ui.Models.IUuidDao {
  const parsed = uuidParse(uuid);
  // Reorder bytes to match the Guid.ToByteArray behavior in C#. See fromUuidDao
  // prettier-ignore
  const reorderedForGuid = [
    parsed[3], parsed[2], parsed[1], parsed[0],
    parsed[5], parsed[4],
    parsed[7], parsed[6],
    parsed[8], parsed[9], parsed[10], parsed[11], parsed[12], parsed[13], parsed[14], parsed[15],
  ];
  return { value: Uint8Array.from(reorderedForGuid) };
}

export function toStringValue(
  value: string | undefined | null,
): google.protobuf.IStringValue | null {
  if (value == null) {
    return null;
  }
  return { value };
}

const nanoFactor = BigNumber('1000000000');
// Converts a BigNumber to a DecimalValue DAO
export function toDecimalDao(
  number: BigNumber,
): LiftLog.Ui.Models.DecimalValue {
  const units = number.integerValue(BigNumber.ROUND_FLOOR);
  const nanos = number
    .minus(BigNumber(units))
    .multipliedBy(nanoFactor)
    .integerValue();
  return new LiftLog.Ui.Models.DecimalValue({
    units: Long.fromString(units.toString()),
    nanos: nanos.toNumber(),
  });
}

export function toTimestampDao(instant: Instant): google.protobuf.Timestamp {
  return new google.protobuf.Timestamp({
    seconds: Long.fromNumber(Math.floor(instant.toEpochMilli() / 1000)),
    // TODO we are dropping nanos
  });
}

export function toDateOnlyDao(date: LocalDate): LiftLog.Ui.Models.DateOnlyDao {
  return new LiftLog.Ui.Models.DateOnlyDao({
    year: date.year(),
    month: date.monthValue(),
    day: date.dayOfMonth(),
  });
}

export function toTimeOnlyDao(time: LocalTime): LiftLog.Ui.Models.TimeOnlyDao {
  const nano = time.nano();
  return new LiftLog.Ui.Models.TimeOnlyDao({
    hour: time.hour(),
    minute: time.minute(),
    second: time.second(),
    millisecond: Math.floor(nano / 1_000_000),
    microsecond: Math.floor((nano % 1_000_000) / 1_000),
  });
}

// Converts a SessionBlueprint to a SessionBlueprint DAO
export function toSessionBlueprintDao(
  model: SessionBlueprint,
): LiftLog.Ui.Models.SessionBlueprintDao.SessionBlueprintDaoV2 {
  return new LiftLog.Ui.Models.SessionBlueprintDao.SessionBlueprintDaoV2({
    name: model.name,
    exerciseBlueprints: model.exercises.map(toExerciseBlueprintDao),
    notes: model.notes,
  });
}

// Converts an ExerciseBlueprint to an ExerciseBlueprint DAO
export function toExerciseBlueprintDao(
  model: ExerciseBlueprint,
): LiftLog.Ui.Models.SessionBlueprintDao.ExerciseBlueprintDaoV2 {
  return new LiftLog.Ui.Models.SessionBlueprintDao.ExerciseBlueprintDaoV2({
    name: model.name,
    notes: model.notes,
    link: model.link,
    ...(model instanceof WeightedExerciseBlueprint
      ? {
          type: LiftLog.Ui.Models.SessionBlueprintDao.ExerciseType.WEIGHTED,
          sets: model.sets,
          repsPerSet: model.repsPerSet,
          weightIncreaseOnSuccess: toDecimalDao(model.weightIncreaseOnSuccess),
          restBetweenSets: toRestDao(model.restBetweenSets),
          supersetWithNext: model.supersetWithNext,
        }
      : {
          type: LiftLog.Ui.Models.SessionBlueprintDao.ExerciseType.CARDIO,
          cardioTarget: toCardioTargetDao(model.target),
          trackDuration: model.trackDuration,
          trackDistance: model.trackDistance,
          trackResistance: model.trackResistance,
          trackIncline: model.trackIncline,
        }),
  });
}

function toCardioTargetDao(
  target: CardioTarget,
): LiftLog.Ui.Models.SessionBlueprintDao.CardioTarget {
  return new LiftLog.Ui.Models.SessionBlueprintDao.CardioTarget({
    type: target.type,
    distanceValue:
      target.type === 'distance' ? toDecimalDao(target.value.value) : null,
    distanceUnit: target.type === 'distance' ? target.value.unit : null,
    timeValue: target.type === 'time' ? toDurationDao(target.value) : null,
  });
}

// Converts a Rest model to a Rest DAO
export function toRestDao(
  model: Rest,
): LiftLog.Ui.Models.SessionBlueprintDao.RestDaoV2 {
  return new LiftLog.Ui.Models.SessionBlueprintDao.RestDaoV2({
    minRest: toDurationDao(model.minRest),
    maxRest: toDurationDao(model.maxRest),
    failureRest: toDurationDao(model.failureRest),
  });
}

export function toDurationDao(
  duration: Duration | undefined,
): google.protobuf.Duration | null {
  if (!duration) {
    return null;
  }
  return new google.protobuf.Duration({
    seconds: Long.fromNumber(Math.floor(duration.seconds())),
    nanos: duration.nano(),
  });
}

// Converts a ProgramBlueprint to a ProgramBlueprint DAO
export function toProgramBlueprintDao(
  model: ProgramBlueprint,
): LiftLog.Ui.Models.ProgramBlueprintDao.ProgramBlueprintDaoV1 {
  return new LiftLog.Ui.Models.ProgramBlueprintDao.ProgramBlueprintDaoV1({
    name: model.name,
    sessions: model.sessions.map(toSessionBlueprintDao),
    lastEdited: toDateOnlyDao(model.lastEdited),
  });
}

// Converts a FeedIdentity to a FeedIdentity DAO
export function toFeedIdentityDao(
  model: FeedIdentity,
): LiftLog.Ui.Models.FeedIdentityDaoV1 {
  return new LiftLog.Ui.Models.FeedIdentityDaoV1({
    id: toUuidDao(model.id),
    lookup: { value: model.lookup },
    aesKey: model.aesKey.value,
    publicKey: model.rsaKeyPair.publicKey.spkiPublicKeyBytes,
    privateKey: model.rsaKeyPair.privateKey.pkcs8PrivateKeyBytes,
    password: model.password,
    name: toStringValue(model.name),
    profilePicture: model.profilePicture ?? null,
    publishBodyweight: model.publishBodyweight,
    publishPlan: model.publishPlan,
    publishWorkouts: model.publishWorkouts,
  });
}

// Converts a FeedUser to a FeedUser DAO
export function toFeedUserDao(
  model: FeedUser,
): LiftLog.Ui.Models.FeedUserDaoV1 {
  return new LiftLog.Ui.Models.FeedUserDaoV1({
    id: toUuidDao(model.id),
    name: toStringValue(model.name),
    nickname: toStringValue(model.nickname),
    aesKey: model.aesKey?.value ?? null,
    publicKey: model.publicKey.spkiPublicKeyBytes,
    currentPlan: model.currentPlan ? toCurrentPlanDao(model.currentPlan) : null,
    profilePicture: model.profilePicture ?? null,
    followSecret: toStringValue(model.followSecret),
  });
}

// Converts a CurrentPlan to a CurrentPlan DAO
export function toCurrentPlanDao(
  sessions: SessionBlueprint[],
): LiftLog.Ui.Models.CurrentPlanDaoV1 {
  return new LiftLog.Ui.Models.CurrentPlanDaoV1({
    sessions: sessions.map(toSessionBlueprintDao),
  });
}

export function toSessionHistoryDao(
  model: Record<string, SessionPOJO>,
): LiftLog.Ui.Models.SessionHistoryDao.SessionHistoryDaoV2 {
  return new LiftLog.Ui.Models.SessionHistoryDao.SessionHistoryDaoV2({
    completedSessions: Enumerable.from(model)
      .select((x) => Session.fromPOJO(x.value))
      .select(toSessionDao)
      .toArray(),
  });
}

// Converts a Session to a Session DAO
export function toSessionDao(
  model: Session,
): LiftLog.Ui.Models.SessionHistoryDao.SessionDaoV2 {
  return new LiftLog.Ui.Models.SessionHistoryDao.SessionDaoV2({
    id: toUuidDao(model.id),
    sessionName: model.blueprint.name,
    blueprintNotes: model.blueprint.notes,
    recordedExercises: model.recordedExercises.map(toRecordedExerciseDao),
    date: toDateOnlyDao(model.date),
    bodyweightValue: model.bodyweight
      ? toDecimalDao(model.bodyweight.value)
      : null,
    bodyweightUnit: model.bodyweight
      ? toWeightUnitDao(model.bodyweight.unit)
      : LiftLog.Ui.Models.WeightUnit.NIL,
  });
}

export function toWeightUnitDao(
  weightUnit: WeightUnit,
): LiftLog.Ui.Models.WeightUnit {
  return match(weightUnit)
    .with('kilograms', () => LiftLog.Ui.Models.WeightUnit.KILOGRAMS)
    .with('pounds', () => LiftLog.Ui.Models.WeightUnit.POUNDS)
    .with('nil', () => LiftLog.Ui.Models.WeightUnit.NIL)
    .exhaustive();
}

// Converts a RecordedExercise to a RecordedExercise DAO
export function toRecordedExerciseDao(
  model: RecordedExercise,
): LiftLog.Ui.Models.SessionHistoryDao.RecordedExerciseDaoV2 {
  return new LiftLog.Ui.Models.SessionHistoryDao.RecordedExerciseDaoV2({
    exerciseBlueprint: toExerciseBlueprintDao(model.blueprint),
    notes: toStringValue(model.notes),
    ...(model instanceof RecordedWeightedExercise
      ? {
          type: LiftLog.Ui.Models.SessionBlueprintDao.ExerciseType.WEIGHTED,
          potentialSets: model.potentialSets.map(toPotentialSetDao),
        }
      : {
          type: LiftLog.Ui.Models.SessionBlueprintDao.ExerciseType.CARDIO,
          completionDateTime: toDateTimeDao(model.completionDateTime),
          duration: toDurationDao(model.duration),
          distanceValue: model.distance
            ? toDecimalDao(model.distance.value)
            : null,
          distanceUnit: model.distance ? { value: model.distance.unit } : null,
          resistance: model.resistance ? toDecimalDao(model.resistance) : null,
          incline: model.incline ? toDecimalDao(model.incline) : null,
        }),
  });
}

export function toDateTimeDao(
  model: OffsetDateTime | undefined,
): LiftLog.Ui.Models.DateTimeDao | null {
  if (!model) {
    return null;
  }
  return new LiftLog.Ui.Models.DateTimeDao({
    date: toDateOnlyDao(model.toLocalDate()),
    time: toTimeOnlyDao(model.toLocalTime()),
    offset: { totalSeconds: model.offset().totalSeconds() },
  });
}

export function toPotentialSetDao(
  model: PotentialSet,
): LiftLog.Ui.Models.SessionHistoryDao.PotentialSetDaoV2 {
  return new LiftLog.Ui.Models.SessionHistoryDao.PotentialSetDaoV2({
    recordedSet: model.set ? toRecordedSetDao(model.set) : null,
    weightValue: toDecimalDao(model.weight.value),
    weightUnit: toWeightUnitDao(model.weight.unit),
  });
}

// Converts a RecordedSet to a RecordedSet DAO
export function toRecordedSetDao(
  model: RecordedSet,
): LiftLog.Ui.Models.SessionHistoryDao.RecordedSetDaoV2 {
  return new LiftLog.Ui.Models.SessionHistoryDao.RecordedSetDaoV2({
    repsCompleted: model.repsCompleted,
    completionDate: toDateOnlyDao(model.completionDateTime.toLocalDate()),
    completionTime: toTimeOnlyDao(model.completionDateTime.toLocalTime()),
    completionOffset: {
      totalSeconds: model.completionDateTime.offset().totalSeconds(),
    },
  });
}

export function toCurrentSessionDao(model: {
  workoutSession: Session | undefined;
  historySession: Session | undefined;
}): LiftLog.Ui.Models.CurrentSessionStateDao.CurrentSessionStateDaoV2 {
  return new LiftLog.Ui.Models.CurrentSessionStateDao.CurrentSessionStateDaoV2({
    historySession:
      (model.historySession && toSessionDao(model.historySession)) ?? null,
    workoutSession:
      (model.workoutSession && toSessionDao(model.workoutSession)) ?? null,
  });
}

export function toFeedItemDao(item: FeedItem): LiftLog.Ui.Models.FeedItemDaoV1 {
  return new LiftLog.Ui.Models.FeedItemDaoV1({
    eventId: toUuidDao(item.eventId),
    expiry: toTimestampDao(item.expiry),
    timestamp: toTimestampDao(item.timestamp),
    userId: toUuidDao(item.userId),
    session:
      item instanceof SessionFeedItem ? toSessionDao(item.session) : null,
  });
}

export function toFeedStateDao(
  state: FeedState,
): LiftLog.Ui.Models.FeedStateDaoV1 {
  return new LiftLog.Ui.Models.FeedStateDaoV1({
    feedItems: state.feed.map((x) => toFeedItemDao(FeedItem.fromPOJO(x))),
    followedUsers: Object.values(state.followedUsers).map((x) =>
      toFeedUserDao(FeedUser.fromPOJO(x)),
    ),
    followers: Object.values(state.followers).map((x) =>
      toFeedUserDao(FeedUser.fromPOJO(x)),
    ),
    followRequests: state.followRequests.map((x) =>
      toFollowRequestDao(FollowRequest.fromPOJO(x)),
    ),
    identity: state.identity
      .map(FeedIdentity.fromPOJO)
      .map(toFeedIdentityDao)
      .unwrapOr(null),
    unpublishedSessionIds: state.unpublishedSessionIds.map(toUuidDao),
    revokedFollowSecrets: state.revokedFollowSecrets,
  });
}

export function toSharedItemDao(
  item: SharedItem,
): LiftLog.Ui.Models.SharedItemPayload {
  const sharedProgramBlueprint =
    item instanceof SharedProgramBlueprint
      ? new LiftLog.Ui.Models.SharedProgramBlueprintPayload({
          programBlueprint: toProgramBlueprintDao(item.programBlueprint),
        })
      : null;
  return new LiftLog.Ui.Models.SharedItemPayload({
    sharedProgramBlueprint,
  });
}

function toFollowRequestDao(
  request: FollowRequest,
): LiftLog.Ui.Models.InboxMessageDao {
  return new LiftLog.Ui.Models.InboxMessageDao({
    fromUserId: toUuidDao(request.userId),
    followRequest: {
      name: toStringValue(request.name),
    },
  });
}

export function toWeightDao(weight: Weight): LiftLog.Ui.Models.Weight {
  return LiftLog.Ui.Models.Weight.create({
    unit: toWeightUnitDao(weight.unit),
    value: toDecimalDao(weight.value),
  });
}
