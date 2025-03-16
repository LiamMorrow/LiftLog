import { RecordedExercise } from '@/models/session-models';
import { LocalDateTime } from '@js-joda/core';

export interface DatedRecordedExercise {
  readonly date: LocalDateTime;
  readonly recordedExercise: RecordedExercise;
}
