import { google, LiftLog } from '@/gen/proto';
import { LocalDate, LocalTime } from '@js-joda/core';
import BigNumber from 'bignumber.js';
import Long from 'long';
import {
  ExerciseBlueprint,
  ProgramBlueprint,
  Rest,
  SessionBlueprint,
} from '@/models/blueprint-models';
import { FeedIdentity, FeedUser } from '@/models/feed-models';
import { parse as uuidParse } from 'uuid';
import {
  PotentialSet,
  RecordedExercise,
  RecordedSet,
  Session,
} from '@/models/session-models';

function toUuidDao(uuid: string): LiftLog.Ui.Models.IUuidDao {
  return { value: uuidParse(uuid) };
}

function toStringValue(
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

// Converts a LocalDate to a DateOnly DAO
export function toDateOnlyDao(date: LocalDate): LiftLog.Ui.Models.DateOnlyDao {
  return new LiftLog.Ui.Models.DateOnlyDao({
    year: date.year(),
    month: date.monthValue(),
    day: date.dayOfMonth(),
  });
}

// Converts a LocalTime to a TimeOnly DAO
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
    sets: model.sets,
    repsPerSet: model.repsPerSet,
    weightIncreaseOnSuccess: toDecimalDao(model.weightIncreaseOnSuccess),
    restBetweenSets: toRestDao(model.restBetweenSets),
    supersetWithNext: model.supersetWithNext,
    notes: model.notes,
    link: model.link,
  });
}

// Converts a Rest model to a Rest DAO
export function toRestDao(
  model: Rest,
): LiftLog.Ui.Models.SessionBlueprintDao.RestDaoV2 {
  return new LiftLog.Ui.Models.SessionBlueprintDao.RestDaoV2({
    minRest: { seconds: Long.fromNumber(model.minRest.toMillis() / 1000) },
    maxRest: { seconds: Long.fromNumber(model.maxRest.toMillis() / 1000) },
    failureRest: {
      seconds: Long.fromNumber(model.failureRest.toMillis() / 1000),
    },
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
    bodyweight: model.bodyweight ? toDecimalDao(model.bodyweight) : null,
  });
}

// Converts a RecordedExercise to a RecordedExercise DAO
export function toRecordedExerciseDao(
  model: RecordedExercise,
): LiftLog.Ui.Models.SessionHistoryDao.RecordedExerciseDaoV2 {
  return new LiftLog.Ui.Models.SessionHistoryDao.RecordedExerciseDaoV2({
    exerciseBlueprint: toExerciseBlueprintDao(model.blueprint),
    potentialSets: model.potentialSets.map(toPotentialSetDao),
    notes: toStringValue(model.notes),
    perSetWeight: model.perSetWeight,
  });
}

// Converts a PotentialSet to a PotentialSet DAO
export function toPotentialSetDao(
  model: PotentialSet,
): LiftLog.Ui.Models.SessionHistoryDao.PotentialSetDaoV2 {
  return new LiftLog.Ui.Models.SessionHistoryDao.PotentialSetDaoV2({
    recordedSet: model.set ? toRecordedSetDao(model.set) : null,
    weight: toDecimalDao(model.weight),
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
  });
}
