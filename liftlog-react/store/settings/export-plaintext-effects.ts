import { RecordedExercise, Session } from '@/models/session-models';
import { addEffect } from '@/store/listenerMiddleware';
import { exportPlainText } from '@/store/settings';
import Enumerable from 'linq';
import { match } from 'ts-pattern';
import BigNumber from 'bignumber.js';
import { jsonToCSV } from 'react-native-csv';

export function addExportPlaintextEffects() {
  addEffect(
    exportPlainText,
    async (
      { payload: { format } },
      { getState, extra: { progressRepository, fileExportService } },
    ) => {
      const unit = getState().settings.useImperialUnits ? 'lbs' : 'kg';
      const sessions = progressRepository.getOrderedSessions();
      const [fileName, bytes, contentType] = await match(format)
        .with(
          'CSV',
          async () =>
            [
              'liftlog-export.csv',
              await exportToCsv(sessions, unit),
              'text/csv',
            ] as const,
        )
        .exhaustive();

      await fileExportService.exportBytes(fileName, bytes, contentType);
    },
  );
}

async function exportToCsv(
  sessions: Enumerable.IEnumerable<Session>,
  unit: string,
): Promise<Uint8Array> {
  const exportedSets = sessions
    .selectMany((session) =>
      session.recordedExercises.map((exercise) => ({ session, exercise })),
    )
    .selectMany(({ session, exercise }) =>
      ExportedSetCsvRow.fromModel(session, exercise, unit),
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
    unit: string,
  ): ExportedSetCsvRow[] {
    return exercise.potentialSets
      .filter((x) => x.set)
      .map(
        (set) =>
          new ExportedSetCsvRow(
            session.id,
            set.set!.completionDateTime.toString(),
            exercise.blueprint.name,
            set.weight,
            unit,
            set.set!.repsCompleted,
            exercise.blueprint.repsPerSet,
            exercise.notes ?? '',
          ),
      );
  }
}
