import { LiftLog } from '@/gen/proto';

import Enumerable from 'linq';

import { EmptySession, Session } from '@/models/session-models/session';
import {
  PotentialSet,
  RecordedSet,
  RecordedWeightedExercise,
  WeightAppliesTo,
} from '@/models/session-models/recorded-weighted-exercise';
import {
  RecordedCardioExercise,
  RecordedCardioExerciseSet,
} from '@/models/session-models/recorded-cardio-exercise';
import {
  fromRecordedExerciseJSON,
  RecordedExercise,
} from '@/models/session-models/recorded-exercise';

export {
  RecordedWeightedExercise,
  Session,
  PotentialSet,
  RecordedCardioExercise,
  RecordedCardioExerciseSet,
  RecordedExercise,
  RecordedSet,
  EmptySession,
  fromRecordedExerciseJSON,
  WeightAppliesTo,
};

export function toSessionHistoryDao(
  model: Record<string, Session>,
): LiftLog.Ui.Models.SessionHistoryDao.SessionHistoryDaoV2 {
  return new LiftLog.Ui.Models.SessionHistoryDao.SessionHistoryDaoV2({
    completedSessions: Enumerable.from(model)
      .select((x) => x.value.toDao())
      .toArray(),
  });
}
