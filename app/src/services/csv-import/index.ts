export { parseWorkoutCsv, type WorkoutCsvRow, type ParseWorkoutCsvResult } from './workout-csv';
export {
  parseStrongLiftsCsv,
  strongLiftsRowsToSessions,
  type StrongLiftsCsvRow,
  type ParseStrongLiftsCsvResult,
} from './stronglifts-csv';
export {
  csvRowsToSessions,
  sessionIdFromCsvContent,
  CSV_IMPORT_SESSION_NAMESPACE,
  type CsvImportOptions,
} from './csv-to-sessions';
import { parseWorkoutCsv } from './workout-csv';
import { parseStrongLiftsCsv, strongLiftsRowsToSessions } from './stronglifts-csv';
import { csvRowsToSessions, CsvImportOptions } from './csv-to-sessions';
import { BackupData } from '@/models/backup';
import { Session } from '@/models/session-models';

export type ImportCsvResult =
  | { ok: true; sessions: Session[] }
  | { ok: false; error: string };

function decodeCsvBytes(contentBytes: Uint8Array): string {
  try {
    return new TextDecoder('utf-8').decode(contentBytes);
  } catch {
    throw new Error('Could not read the selected file as text');
  }
}

/** Parse FitNotes-shaped workout history CSV text and map to Session[]. */
export function importCsvText(csvText: string, options?: CsvImportOptions): ImportCsvResult {
  const parsed = parseWorkoutCsv(csvText);
  if (!parsed.ok) {
    return parsed;
  }
  const sessions = csvRowsToSessions(parsed.rows, options);
  if (sessions.length === 0) {
    return { ok: false, error: 'No weighted sets found to import' };
  }
  return { ok: true, sessions };
}

/** Parse StrongLifts CSV text and map to Session[]. */
export function importStrongLiftsCsvText(
  csvText: string,
  options?: CsvImportOptions,
): ImportCsvResult {
  const parsed = parseStrongLiftsCsv(csvText);
  if (!parsed.ok) {
    return parsed;
  }
  const sessions = strongLiftsRowsToSessions(parsed.rows, parsed.weightUnit, options);
  if (sessions.length === 0) {
    return { ok: false, error: 'No weighted sets found to import' };
  }
  return { ok: true, sessions };
}

/**
 * FitNotes CSV column layout → BackupData for importBackupData.
 * Throws Error with a user-facing message on parse/map failure.
 */
export function getImportForFitNotes(contentBytes: Uint8Array, options?: CsvImportOptions): BackupData {
  const result = importCsvText(decodeCsvBytes(contentBytes), options);
  if (!result.ok) {
    throw new Error(result.error);
  }
  return {
    workouts: result.sessions,
    programs: {},
  };
}

/**
 * StrongLifts CSV export → BackupData for importBackupData.
 * Throws Error with a user-facing message on parse/map failure.
 */
export function getImportForStrongLifts(
  contentBytes: Uint8Array,
  options?: CsvImportOptions,
): BackupData {
  const result = importStrongLiftsCsvText(decodeCsvBytes(contentBytes), options);
  if (!result.ok) {
    throw new Error(result.error);
  }
  return {
    workouts: result.sessions,
    programs: {},
  };
}
