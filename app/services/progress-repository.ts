import { RecordedExercise, SessionPOJO } from '@/models/session-models';
import { TemporalComparer } from '@/models/comparers';
import { Session } from '@/models/session-models';
import Enumerable from 'linq';
import { RootState } from '@/store';
import { KeyedExerciseBlueprint } from '@/models/blueprint-models';
import { ZoneId } from '@js-joda/core';

export class ProgressRepository {
  constructor(private getState: () => RootState) {}

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
        (x) =>
          x.lastExercise?.latestTime ??
          x.date
            .atStartOfDay()
            .atZone(ZoneId.systemDefault())
            .toOffsetDateTime(),
        TemporalComparer,
      );
  }

  getLatestRecordedExercises(): Enumerable.IDictionary<
    string,
    RecordedExercise
  > {
    return this.getOrderedSessions()
      .selectMany((x) => x.recordedExercises)
      .groupBy((x) =>
        KeyedExerciseBlueprint.fromExerciseBlueprint(x.blueprint).toString(),
      )
      .toDictionary(
        (x) => x.key(),
        (x) => x.first(),
      );
  }
}
