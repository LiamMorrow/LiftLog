import { LiftLog } from '@/gen/proto';
import {
  KeyedExerciseBlueprint,
  NormalizedName,
  NormalizedNameKey,
} from '@/models/blueprint-models';
import { TemporalComparer } from '@/models/comparers';
import { RecordedExercise, Session } from '@/models/session-models';
import { fromSessionDao } from '@/models/storage/conversions.from-dao';
import { KeyValueStore } from '@/services/key-value-store';
import { Logger } from '@/services/logger';
import Enumerable from 'linq';
import { match } from 'ts-pattern';
global.Buffer = require('buffer').Buffer;

const storageKey = 'Progress';
export class ProgressRepository {
  constructor(
    private keyValueStore: KeyValueStore,
    logger: Logger,
  ) {}

  // Ensure initialize is called at the beginning of every operation
  private storedSessions: ReadonlyMap<string, Session> = undefined!;
  private initializePromise: Promise<void> | undefined;

  async getOrderedSessions(): Promise<Enumerable.IEnumerable<Session>> {
    await this.initialize();

    return Enumerable.from(this.storedSessions.values())
      .orderByDescending((x) => x.date, TemporalComparer)
      .thenByDescending(
        (x) => x.lastExercise?.lastRecordedSet?.set?.completionDateTime,
        TemporalComparer,
      );
  }

  async saveCompletedSession(session: Session): Promise<void> {
    await this.initialize();

    const cloned = new Map(this.storedSessions);
    this.storedSessions = cloned;
    cloned.set(session.id, session);
    await this.persist();
  }

  async getLatestOrderedRecordedExercises(
    maxRecordsPerExercise: number,
  ): Promise<Record<NormalizedNameKey, RecordedExercise[]>> {
    return (await this.getOrderedSessions())
      .selectMany((x) =>
        x.recordedExercises.filter((x) => x.lastRecordedSet?.set),
      )
      .groupBy((x) =>
        NormalizedName.fromExerciseBlueprint(x.blueprint).toString(),
      )
      .toObject(
        (x) => x.key(),
        (x) => x.take(maxRecordsPerExercise).toArray(),
      );
  }

  async getLatestRecordedExercises(): Promise<
    Enumerable.IDictionary<KeyedExerciseBlueprint, RecordedExercise>
  > {
    await this.initialize();

    return (await this.getOrderedSessions())
      .selectMany((x) => x.recordedExercises)
      .groupBy((x) => KeyedExerciseBlueprint.fromExerciseBlueprint(x.blueprint))
      .toDictionary(
        (x) => x.key(),
        (x) => x.first(),
      );
  }
  async deleteSession(session: Session) {
    await this.initialize();
    const cloned = new Map(this.storedSessions);
    cloned.delete(session.id);
    this.storedSessions = new Map(this.storedSessions);
    await this.persist();
  }

  private async persist() {
    if (!this.storedSessions) {
      throw new Error('Failed to persist as not initialized');
    }
    await Promise.all([
      this.keyValueStore.setItem(`${storageKey}-Version`, '2'),
      this.keyValueStore.setItem(storageKey, 'TODO_PROTOBUF'),
    ]);
  }

  private async initialize() {
    this.initializePromise ??= (async () => {
      let version = await this.keyValueStore.getItem(`${storageKey}-Version`);
      if (!version) {
        version = '2';
        await this.keyValueStore.setItem(`${storageKey}-Version`, '2');
      }

      const storedData = await match(version)
        .with('2', async () =>
          LiftLog.Ui.Models.SessionHistoryDao.SessionHistoryDaoV2.decode(
            (await this.keyValueStore.getItemBytes(storageKey)) ??
              Buffer.from([]),
          ),
        )
        .otherwise((x) => {
          throw new Error(`Unsupported version ${x}`);
        });

      this.storedSessions = new Map<string, Session>(
        storedData?.completedSessions
          .map(fromSessionDao)
          .map((x) => [x.id, x]) ?? [],
      );
    })();
    await this.initializePromise;
  }
}
