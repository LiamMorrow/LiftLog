import { LiftLog } from '@/gen/proto';
import { SessionBlueprint } from '@/models/blueprint-models';
import {
  PotentialSet,
  PotentialSetPOJO,
  RecordedExercise,
  RecordedExercisePOJO,
  Session,
  SessionPOJO,
} from '@/models/session-models';
import BigNumber from 'bignumber.js';
import { stringify as uuidStringify } from 'uuid';

// We write all these functions as nullish accepting, because that is how they are in proto. In general though, we want to ensure that the value is there.
function fromUuidDao(
  dao: LiftLog.Ui.Models.IUuidDao | null | undefined,
): string {
  if (!dao?.value) {
    throw new Error('UUID dao cannot be null');
  }
  return uuidStringify(dao.value);
}

const nanoFactor = BigNumber('1000000000');
export function fromDecimalDao(
  dao: LiftLog.Ui.Models.IDecimalValue | null | undefined,
) {
  if (dao?.nanos == null || dao?.units == null) {
    throw new Error('DecimalDao cannot be null');
  }
  return BigNumber(dao.units.toString()).plus(
    BigNumber(dao.nanos).div(nanoFactor),
  );
}

function fromPotentialSetDao(
  dao:
    | LiftLog.Ui.Models.SessionHistoryDao.IPotentialSetDaoV2
    | null
    | undefined,
): PotentialSetPOJO {
  if (!dao) {
    throw new Error('PotentialSetDao cannot be null');
  }
  return PotentialSet.fromPOJO({});
}

function fromRecordedExerciseDao(
  dao:
    | LiftLog.Ui.Models.SessionHistoryDao.IRecordedExerciseDaoV2
    | null
    | undefined,
): RecordedExercisePOJO {
  if (!dao) {
    throw new Error('Recorded exercise DAO cannot be null');
  }
  return RecordedExercise.fromPOJO({
    notes: dao.notes,
    blueprint: fromExerciseBlueprintDao(dao.exerciseBlueprint),
    perSetWeight: dao.perSetWeight!,
    potentialSets: dao.potentialSets!.map(fromPotentialSetDao),
  });
}

export function fromSessionDao(
  dao: LiftLog.Ui.Models.SessionHistoryDao.ISessionDaoV2 | null | undefined,
): SessionPOJO {
  if (!dao) {
    throw new Error('Session dao cannot be null');
  }
  const recordedExercises =
    dao.recordedExercises?.map(fromRecordedExerciseDao) ?? [];
  return Session.fromPOJO({
    id: fromUuidDao(dao.id),
    blueprint: fromSessionBlueprintDao(
      SessionBlueprint.fromPOJO({
        name: dao.sessionName,
        exercises: recordedExercises.map((x) => x.blueprint),
        notes: dao.blueprintNotes ?? '',
      }).toPOJO(),
    ),
    bodyweight: dao.bodyweight ? fromDecimalDao(dao.bodyweight) : undefined,
    date: fromDateOnlyDao(dao.date),
    recordedExercises,
  }).toPOJO();
}

export function fromSessionHistoryDao(
  sessionHistoryModel: LiftLog.Ui.Models.SessionHistoryDao.SessionHistoryDaoV2,
): Map<string, Session> {
  return sessionHistoryModel.completedSessions.reduce((map, item) => {
    map.set(fromUuidDao(item.id), fromSessionDao(item));
    return map;
  }, new Map<string, Session>());
}
