import {
  KeyedExerciseBlueprint,
  NormalizedName,
  NormalizedNameKey,
  SessionPOJO,
} from '@/models/session-models';
import { LocalDateTimeComparer, TemporalComparer } from '@/models/comparers';
import { RecordedExercise, Session } from '@/models/session-models';
import Enumerable from 'linq';
import { RootState } from '@/store';
import { UnknownAction } from '@reduxjs/toolkit';
import { addStoredSession } from '@/store/stored-sessions';

export class ProgressRepository {
  constructor(
    private getState: () => RootState,
    private dispatch: (u: UnknownAction) => void,
  ) {}

  private getSessionMap(): Record<string, SessionPOJO> {
    if (!this.getState().storedSessions.isHydrated) {
      throw new Error('Tried to get stored session state before hydration');
    }
    return this.getState().storedSessions.sessions;
  }

  getOrderedSessions(): Enumerable.IEnumerable<Session> {
    const sessions = this.getSessionMap();

    return Enumerable.from(sessions)
      .select((x) => Session.fromPOJO(x.value))
      .orderByDescending((x) => x.date, TemporalComparer)
      .thenByDescending(
        (x) => x.lastExercise?.lastRecordedSet?.set?.completionDateTime,
        TemporalComparer,
      );
  }

  async saveCompletedSession(session: Session): Promise<void> {
    this.dispatch(addStoredSession(session));
  }

  getLatestOrderedRecordedExercises(
    maxRecordsPerExercise: number,
  ): Record<NormalizedNameKey, RecordedExercise[]> {
    return this.getOrderedSessions()
      .selectMany((x) =>
        x.recordedExercises.filter((x) => x.lastRecordedSet?.set),
      )
      .groupBy((x) =>
        NormalizedName.fromExerciseBlueprint(x.blueprint).toString(),
      )
      .toObject(
        (x) => x.key(),
        (x) =>
          x
            .orderByDescending(
              (x) => x.lastRecordedSet!.set!.completionDateTime,
              LocalDateTimeComparer,
            )
            .take(maxRecordsPerExercise)
            .toArray(),
      );
  }

  getLatestRecordedExercises(): Enumerable.IDictionary<
    KeyedExerciseBlueprint,
    RecordedExercise
  > {
    return this.getOrderedSessions()
      .selectMany((x) => x.recordedExercises)
      .groupBy((x) => KeyedExerciseBlueprint.fromExerciseBlueprint(x.blueprint))
      .toDictionary(
        (x) => x.key(),
        (x) => x.first(),
      );
  }
}
