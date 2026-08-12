import { cell, parseCsvTable, parseOptionalNumber } from '@/services/csv-import/csv-parse-utils';
import { CsvImportOptions, NormalizedImportSession } from '@/services/csv-import/csv-to-sessions';
import { WeightUnit } from '@/models/weight';
import { LocalDate } from '@js-joda/core';

/** One set row from a FitNotes-style workout history CSV export. */
export type FitNotesCsvRow = {
  date: string;
  exercise: string;
  weight: number | undefined;
  weightUnit: string;
  reps: number | undefined;
  comment: string;
};

export type ParseFitNotesCsvResult = { ok: true; rows: FitNotesCsvRow[] } | { ok: false; error: string };

const REQUIRED_HEADERS = ['Date', 'Exercise', 'Weight', 'Weight Unit', 'Reps'] as const;

function mapWeightUnit(raw: string, fallback: WeightUnit): WeightUnit {
  const u = raw.trim().toLowerCase();
  if (!u) {
    return fallback;
  }
  if (u === 'kg' || u === 'kgs' || u === 'kilogram' || u === 'kilograms') {
    return 'kilograms';
  }
  if (u === 'lb' || u === 'lbs' || u === 'pound' || u === 'pounds') {
    return 'pounds';
  }
  return fallback;
}

function parseLocalDate(raw: string): LocalDate | undefined {
  try {
    return LocalDate.parse(raw.trim());
  } catch {
    return undefined;
  }
}

/** Parse FitNotes-style CSV (Date, Exercise, Weight, Weight Unit, Reps, …). */
export function parseFitNotesCsv(csvText: string): ParseFitNotesCsvResult {
  const table = parseCsvTable(csvText);
  if (!table.ok) {
    return table;
  }

  const missing = REQUIRED_HEADERS.filter((h) => !table.fields.some((f) => f.toLowerCase() === h.toLowerCase()));
  if (missing.length > 0) {
    return {
      ok: false,
      error: `Missing CSV columns: ${missing.join(', ')}`,
    };
  }

  const rows: FitNotesCsvRow[] = [];
  for (const raw of table.data) {
    const date = cell(raw, 'Date');
    const exercise = cell(raw, 'Exercise');
    if (!date || !exercise) {
      continue;
    }
    rows.push({
      date,
      exercise,
      weight: parseOptionalNumber(cell(raw, 'Weight')),
      weightUnit: cell(raw, 'Weight Unit'),
      reps: parseOptionalNumber(cell(raw, 'Reps')),
      comment: cell(raw, 'Comment'),
    });
  }

  if (rows.length === 0) {
    return { ok: false, error: 'No workout rows found in CSV' };
  }

  return { ok: true, rows };
}

/** Weighted set rows only; cardio-only rows are skipped in v1. */
function isWeightedSetRow(row: FitNotesCsvRow): boolean {
  return row.reps !== undefined && row.weight !== undefined;
}

/**
 * Group FitNotes rows by calendar date into normalized sessions.
 * Multiple visits on the same day become one session.
 */
export function fitNotesRowsToNormalized(
  rows: FitNotesCsvRow[],
  options: CsvImportOptions = {},
): NormalizedImportSession[] {
  const defaultWeightUnit = options.defaultWeightUnit ?? 'kilograms';
  const sessionName = options.sessionName ?? 'Imported from FitNotes';

  const byDate = new Map<string, FitNotesCsvRow[]>();
  for (const row of rows) {
    if (!isWeightedSetRow(row)) {
      continue;
    }
    if (!parseLocalDate(row.date)) {
      continue;
    }
    const list = byDate.get(row.date) ?? [];
    list.push(row);
    byDate.set(row.date, list);
  }

  const sessions: NormalizedImportSession[] = [];
  const sortedDates = [...byDate.keys()].sort();

  for (const dateKey of sortedDates) {
    const dayRows = byDate.get(dateKey)!;
    const date = parseLocalDate(dateKey)!;

    const exerciseOrder: string[] = [];
    const byExercise = new Map<string, FitNotesCsvRow[]>();
    for (const row of dayRows) {
      if (!byExercise.has(row.exercise)) {
        exerciseOrder.push(row.exercise);
        byExercise.set(row.exercise, []);
      }
      byExercise.get(row.exercise)!.push(row);
    }

    const exercises = exerciseOrder.map((exerciseName) => {
      const setRows = byExercise.get(exerciseName)!;
      const comments = setRows
        .map((r, i) => {
          const c = r.comment.trim();
          return c ? `Set ${i + 1}: ${c}` : undefined;
        })
        .filter((c): c is string => !!c);
      const notes = comments.length > 0 ? comments.join('\n') : undefined;
      const sets = setRows.map((row) => ({
        reps: row.reps ?? 0,
        weight: row.weight ?? 0,
        unit: mapWeightUnit(row.weightUnit, defaultWeightUnit),
      }));
      return { name: exerciseName, notes, sets };
    });

    if (exercises.length === 0) {
      continue;
    }

    sessions.push({
      contentDateKey: dateKey,
      date,
      sessionName,
      exercises,
    });
  }

  return sessions;
}
