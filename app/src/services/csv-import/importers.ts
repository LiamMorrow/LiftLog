import { BackupData } from '@/models/backup';
import { CsvImportOptions, sessionsFromNormalized } from '@/services/csv-import/csv-to-sessions';
import { fitNotesRowsToNormalized, parseFitNotesCsv } from '@/services/csv-import/fitnotes-csv';
import { parseStrongLiftsCsv, strongLiftsRowsToNormalized } from '@/services/csv-import/stronglifts-csv';

function decodeCsvBytes(contentBytes: Uint8Array): string {
  try {
    return new TextDecoder('utf-8').decode(contentBytes);
  } catch {
    throw new Error('Could not read the selected file as text');
  }
}

/**
 * FitNotes CSV column layout → BackupData for importBackupData.
 * Throws Error with a user-facing message on parse/map failure.
 */
export function getImportForFitNotes(contentBytes: Uint8Array, options?: CsvImportOptions): BackupData {
  const parsed = parseFitNotesCsv(decodeCsvBytes(contentBytes));
  if (!parsed.ok) {
    throw new Error(parsed.error);
  }
  const sessions = sessionsFromNormalized(fitNotesRowsToNormalized(parsed.rows, options));
  if (sessions.length === 0) {
    throw new Error('No weighted sets found to import');
  }
  return {
    workouts: sessions,
    programs: {},
  };
}

/**
 * StrongLifts CSV export → BackupData for importBackupData.
 * Throws Error with a user-facing message on parse/map failure.
 */
export function getImportForStrongLifts(contentBytes: Uint8Array, options?: CsvImportOptions): BackupData {
  const parsed = parseStrongLiftsCsv(decodeCsvBytes(contentBytes));
  if (!parsed.ok) {
    throw new Error(parsed.error);
  }
  const sessions = sessionsFromNormalized(strongLiftsRowsToNormalized(parsed.rows, parsed.weightUnit, options));
  if (sessions.length === 0) {
    throw new Error('No weighted sets found to import');
  }
  return {
    workouts: sessions,
    programs: {},
  };
}
