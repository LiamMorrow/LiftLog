import {
  RecordedCardioExercise,
  RecordedExercise,
  Session,
} from '@/models/session-models';
import { addEffect } from '@/store/store';
import { exportPlainText } from '@/store/settings';
import Enumerable from 'linq';
import { match } from 'ts-pattern';
import BigNumber from 'bignumber.js';
import { jsonToCSV } from 'react-native-csv';
import { shortFormatWeightUnit } from '@/models/weight';

export function addExportPlaintextEffects() {
  addEffect(
    exportPlainText,
    async (
      { payload: { format } },
      { getState, extra: { progressRepository, fileExportService } },
    ) => {
      const sessions = progressRepository.getOrderedSessions();
      const [fileName, bytes, contentType] = await match(format)
        .with(
          'CSV',
          async () =>
            [
              'liftlog-export.csv',
              await exportToCsv(sessions),
              'text/csv',
            ] as const,
        )
        .with(
          'JSON',
          async () =>
            [
              'liftlog-export.json',
              await exportToJson(sessions),
              'application/json',
            ] as const,
        )
        .exhaustive();

      await fileExportService.exportBytes(fileName, bytes, contentType);
    },
  );
}

async function exportToJson(
  sessions: Enumerable.IEnumerable<Session>,
): Promise<Uint8Array> {
  const exportedSets = sessions
    .select((x) => ({
      ...x.toPOJO(),
      blueprint: { ...x.blueprint.toPOJO(), exercises: undefined },
    }))
    .toArray();
  return new TextEncoder().encode(JSON.stringify(exportedSets));
}

async function exportToCsv(
  sessions: Enumerable.IEnumerable<Session>,
): Promise<Uint8Array> {
  const exportedSets = sessions
    .selectMany((session) =>
      session.recordedExercises.map((exercise) => ({ session, exercise })),
    )
    .selectMany(({ session, exercise }) =>
      ExportedSetCsvRow.fromModel(session, exercise),
    );
  const csvString = jsonToCSV(exportedSets.toArray());
  return new TextEncoder().encode(csvString);
}

class ExportedSetCsvRow {
  constructor(
    public SessionId: string,
    public Timestamp: string,
    public Exercise: string,
    public Weight: BigNumber,
    public WeightUnit: string,
    public Reps: number,
    public TargetReps: number,
    public Notes: string,
  ) {}
  static fromModel(
    session: Session,
    exercise: RecordedExercise,
  ): ExportedSetCsvRow[] {
    // TODO: What do we do about cardio?
    if (exercise instanceof RecordedCardioExercise) {
      return [];
    }
    return exercise.potentialSets
      .filter((x) => x.set)
      .map(
        (set) =>
          new ExportedSetCsvRow(
            session.id,
            set.set!.completionDateTime.toString(),
            exercise.blueprint.name,
            set.weight.value,
            shortFormatWeightUnit(set.weight.unit),
            set.set!.repsCompleted,
            exercise.blueprint.repsPerSet,
            exercise.notes ?? '',
          ),
      );
  }
}
