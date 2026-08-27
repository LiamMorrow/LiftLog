import { cell, parseCsvTable, parseOptionalNumber } from '@/services/csv-import/csv-parse-utils';
import { CsvImportOptions, NormalizedImportSession } from '@/services/csv-import/csv-to-sessions';
import { Weight, WeightUnit } from '@/models/weight';
import { DateTimeFormatter, LocalDate } from '@js-joda/core';

/** One exercise row from a StrongLifts CSV export (sets already expanded). */
export type StrongLiftsCsvRow = {
  date: string;
  workout: string;
  workoutName: string;
  bodyWeight: number | undefined;
  exercise: string;
  notes: string;
  sets: { reps: number; weight: number }[];
};

export type ParseStrongLiftsCsvResult =
  | { ok: true; rows: StrongLiftsCsvRow[]; weightUnit: WeightUnit; bodyWeightUnit: WeightUnit | undefined }
  | { ok: false; error: string };

const REQUIRED_HEADERS = ['Date (yyyy/mm/dd)', 'Exercise'] as const;

/** StrongLifts headers use `KG` or `LB` only (e.g. `Set 1 (KG)`, `Body Weight (LB)`). */
function unitFromHeaderToken(token: string): WeightUnit | undefined {
  const u = token.trim().toLowerCase();
  if (u === 'kg') {
    return 'kilograms';
  }
  if (u === 'lb') {
    return 'pounds';
  }
  return undefined;
}

function findBodyWeightColumn(fields: string[]): { field: string; unit: WeightUnit } | undefined {
  for (const field of fields) {
    const m = field.match(/^Body Weight\s*\(\s*([^)]+)\s*\)$/i);
    if (!m) {
      continue;
    }
    const unit = unitFromHeaderToken(m[1]!);
    if (unit) {
      return { field, unit };
    }
  }
  return undefined;
}

type SetColumnPair = { index: number; repsField: string; weightField: string; unit: WeightUnit };

function findSetColumns(fields: string[]): SetColumnPair[] {
  const repsByIndex = new Map<number, string>();
  const weightByIndex = new Map<number, { field: string; unit: WeightUnit }>();

  for (const field of fields) {
    const repsMatch = field.match(/^Set\s+(\d+)\s*\(\s*Reps\s*\)$/i);
    if (repsMatch) {
      repsByIndex.set(Number(repsMatch[1]), field);
      continue;
    }
    const weightMatch = field.match(/^Set\s+(\d+)\s*\(\s*([^)]+)\s*\)$/i);
    if (weightMatch && !/^reps$/i.test(weightMatch[2]!.trim())) {
      const unit = unitFromHeaderToken(weightMatch[2]!);
      if (unit) {
        weightByIndex.set(Number(weightMatch[1]), { field, unit });
      }
    }
  }

  const indices = [...new Set([...repsByIndex.keys(), ...weightByIndex.keys()])].sort((a, b) => a - b);
  const pairs: SetColumnPair[] = [];
  for (const index of indices) {
    const repsField = repsByIndex.get(index);
    const weightCol = weightByIndex.get(index);
    if (repsField && weightCol) {
      pairs.push({ index, repsField, weightField: weightCol.field, unit: weightCol.unit });
    }
  }
  return pairs;
}

const STRONG_LIFTS_DATE = DateTimeFormatter.ofPattern('yyyy/MM/dd');

/** StrongLifts dates are `yyyy/mm/dd`. Invalid cells are skipped by the caller. */
function parseStrongLiftsDate(raw: string): LocalDate | undefined {
  try {
    return LocalDate.parse(raw.trim(), STRONG_LIFTS_DATE);
  } catch {
    return undefined;
  }
}

/**
 * Parse a StrongLifts workout-history CSV export.
 * One CSV row = one exercise; sets live in `Set N (Reps)` / `Set N (KG|LB)` columns.
 * Sets with empty or 0 reps are skipped (StrongLifts uses 0 both for skips and failed sets).
 */
export function parseStrongLiftsCsv(csvText: string): ParseStrongLiftsCsvResult {
  const table = parseCsvTable(csvText);
  if (!table.ok) {
    return table;
  }

  const fields = table.fields;
  const missing = REQUIRED_HEADERS.filter((h) => !fields.some((f) => f.toLowerCase() === h.toLowerCase()));
  if (missing.length > 0) {
    const hasDate =
      fields.some((f) => f.toLowerCase() === 'date') || fields.some((f) => f.toLowerCase().startsWith('date'));
    const hasExercise = fields.some((f) => f.toLowerCase() === 'exercise');
    if (!hasDate || !hasExercise) {
      return {
        ok: false,
        error: `Missing CSV columns: ${missing.join(', ')}`,
      };
    }
  }

  const setColumns = findSetColumns(fields);
  if (setColumns.length === 0) {
    return {
      ok: false,
      error: 'Missing CSV columns: Set N (Reps) / Set N (KG|LB)',
    };
  }

  const weightUnit = setColumns[0]!.unit;
  const bodyWeightCol = findBodyWeightColumn(fields);
  const rows: StrongLiftsCsvRow[] = [];

  for (const raw of table.data) {
    const date = cell(raw, 'Date (yyyy/mm/dd)', 'Date');
    const exercise = cell(raw, 'Exercise');
    if (!date || !exercise) {
      continue;
    }

    const sets: { reps: number; weight: number }[] = [];
    for (const col of setColumns) {
      const reps = parseOptionalNumber(cell(raw, col.repsField));
      const weight = parseOptionalNumber(cell(raw, col.weightField));
      // 0 reps = skipped slot or failed set in StrongLifts export; omit both in v1.
      if (reps === undefined || reps <= 0 || weight === undefined) {
        continue;
      }
      sets.push({ reps, weight });
    }

    if (sets.length === 0) {
      continue;
    }

    rows.push({
      date,
      workout: cell(raw, 'Workout'),
      workoutName: cell(raw, 'Workout Name'),
      bodyWeight: bodyWeightCol ? parseOptionalNumber(cell(raw, bodyWeightCol.field)) : undefined,
      exercise,
      notes: cell(raw, 'Notes'),
      sets,
    });
  }

  if (rows.length === 0) {
    return { ok: false, error: 'No workout rows found in CSV' };
  }

  return { ok: true, rows, weightUnit, bodyWeightUnit: bodyWeightCol?.unit };
}

/**
 * Group StrongLifts rows by date + Workout number.
 * Workout id is part of contentDateKey so A/B on the same day get distinct stable ids.
 */
export function strongLiftsRowsToNormalized(
  rows: StrongLiftsCsvRow[],
  weightUnit: WeightUnit,
  bodyWeightUnit: WeightUnit | undefined = weightUnit,
  options: CsvImportOptions = {},
): NormalizedImportSession[] {
  const unit = weightUnit !== 'nil' ? weightUnit : (options.defaultWeightUnit ?? 'kilograms');
  const bodyUnit = bodyWeightUnit !== undefined && bodyWeightUnit !== 'nil' ? bodyWeightUnit : unit;

  type Group = {
    dateKey: string;
    date: LocalDate;
    workout: string;
    workoutName: string;
    bodyWeight: number | undefined;
    exercises: StrongLiftsCsvRow[];
  };

  const groups = new Map<string, Group>();
  for (const row of rows) {
    const date = parseStrongLiftsDate(row.date);
    if (!date) {
      continue;
    }
    const dateKey = date.toString();
    const groupKey = `${dateKey}\0${row.workout}`;
    let group = groups.get(groupKey);
    if (!group) {
      group = {
        dateKey,
        date,
        workout: row.workout,
        workoutName: row.workoutName,
        bodyWeight: row.bodyWeight,
        exercises: [],
      };
      groups.set(groupKey, group);
    }
    if (group.bodyWeight === undefined && row.bodyWeight !== undefined) {
      group.bodyWeight = row.bodyWeight;
    }
    if (!group.workoutName && row.workoutName) {
      group.workoutName = row.workoutName;
    }
    group.exercises.push(row);
  }

  const sessions: NormalizedImportSession[] = [];
  const sortedKeys = [...groups.keys()].sort();

  for (const key of sortedKeys) {
    const group = groups.get(key)!;
    const sessionName =
      group.workoutName ||
      (group.workout ? `Workout ${group.workout}` : undefined) ||
      options.sessionName ||
      'Imported';

    const exerciseOrder: string[] = [];
    const byExercise = new Map<string, StrongLiftsCsvRow[]>();
    for (const row of group.exercises) {
      if (!byExercise.has(row.exercise)) {
        exerciseOrder.push(row.exercise);
        byExercise.set(row.exercise, []);
      }
      byExercise.get(row.exercise)!.push(row);
    }

    const exercises = exerciseOrder.flatMap((exerciseName) => {
      const exerciseRows = byExercise.get(exerciseName)!;
      const allSets = exerciseRows.flatMap((r) => r.sets);
      if (allSets.length === 0) {
        return [];
      }
      const noteParts = exerciseRows.map((r) => r.notes.trim()).filter(Boolean);
      const notes = noteParts.length > 0 ? noteParts.join('\n') : undefined;
      return [
        {
          name: exerciseName,
          notes,
          sets: allSets.map((set) => ({ reps: set.reps, weight: set.weight, unit })),
        },
      ];
    });

    if (exercises.length === 0) {
      continue;
    }

    sessions.push({
      contentDateKey: `${group.dateKey}|w${group.workout || '0'}`,
      date: group.date,
      sessionName,
      bodyweight: group.bodyWeight !== undefined ? new Weight(group.bodyWeight, bodyUnit) : undefined,
      exercises,
    });
  }

  return sessions;
}
