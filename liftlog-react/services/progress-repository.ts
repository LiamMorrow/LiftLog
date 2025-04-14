import { KeyedExerciseBlueprint } from '@/models/blueprint-models';
import { TemporalComparer } from '@/models/comparers';
import { RecordedExercise, Session } from '@/models/session-models';
import { KeyValueStore } from '@/services/key-value-store';
import { Logger } from '@/services/logger';
import Enumerable from 'linq';

class ProgressRepositoryImpl {
  constructor(
    private keyValueStore: KeyValueStore,
    logger: Logger,
  ) {}

  // Ensure initialize is called at the beginning of every operation
  private storedSessions: ReadonlyMap<string, Session> = undefined!;

  async getOrderedSessions(): Promise<Enumerable.IEnumerable<Session>> {
    await this.initialize();

    return Enumerable.from(this.storedSessions.values())
      .orderByDescending((x) => x.date, TemporalComparer)
      .thenByDescending(
        (x) => x.lastExercise?.lastRecordedSet?.set?.completionDateTime,
        TemporalComparer,
      );
  }

  async getLatestRecordedExercises(): Promise<
    Enumerable.IDictionary<KeyedExerciseBlueprint, RecordedExercise>
  > {
    return (await this.getOrderedSessions())
      .selectMany((x) => x.recordedExercises)
      .groupBy((x) => KeyedExerciseBlueprint.fromExerciseBlueprint(x.blueprint))
      .toDictionary(
        (x) => x.key(),
        (x) => x.first(),
      );
  }

  private async initialize() {
    if (this.storedSessions) {
      return;
    }
  }
}

export const ProgressRepository = new ProgressRepositoryImpl(
  KeyValueStore,
  Logger,
);
export type ProgressRepository = typeof ProgressRepository;
