import Papa from 'papaparse';
import { SessionBlueprint, WeightedExerciseBlueprint } from '@/models/blueprint-models';
import {
  PotentialSet,
  RecordedSet,
  RecordedWeightedExercise,
  Session,
} from '@/models/session-models';
import { Weight, WeightUnit } from '@/models/weight';
import { sessionIdFromCsvContent, CsvImportOptions } from '@/services/csv-import/csv-to-sessions';
import { LocalDate, LocalTime, ZoneOffset } from '@js-joda/core';

/** One exercise row from a StrongLifts CSV export (sets still in columns). */
export type StrongLiftsCsvRow = {
  date: string;
  workout: string;
  workoutName: string;
  programName: string;
  bodyWeight: number | undefined;
  exercise: string;
  notes: string;
  sets: { reps: number; weight: number }[];
};

export type ParseStrongLiftsCsvResult =
  | { ok: true; rows: StrongLiftsCsvRow[]; weightUnit: WeightUnit }
  | { ok: false; error: string };

const REQUIRED_HEADERS = ['Date (yyyy/mm/dd)', 'Exercise'] as const;

function cell(row: Record<string, string>, ...keys: string[]): string {
  for (const key of keys) {
    const direct = row[key];
    if (direct !== undefined && direct !== '') {
      return direct.trim();
    }
    const found = Object.entries(row).find(([k]) => k.trim().toLowerCase() === key.toLowerCase());
    if (found && found[1] !== undefined && found[1] !== '') {
      return String(found[1]).trim();
    }
  }
  return '';
}

function parseOptionalNumber(raw: string): number | undefined {
  if (!raw) {
    return undefined;
  }
  const n = Number(raw);
  return Number.isFinite(n) ? n : undefined;
}

function unitFromHeaderToken(token: string): WeightUnit | undefined {
  const u = token.trim().toLowerCase();
  if (u === 'kg' || u === 'kgs' || u === 'kilogram' || u === 'kilograms') {
    return 'kilograms';
  }
  if (u === 'lb' || u === 'lbs' || u === 'pound' || u === 'pounds') {
    return 'pounds';
  }
  return undefined;
}

/** Detect weight unit from headers like `Body Weight (KG)` / `Set 1 (LB)`. */
function detectWeightUnit(fields: string[]): WeightUnit | undefined {
  for (const field of fields) {
    const m = field.match(/\(([^)]+)\)\s*$/);
    if (!m) {
      continue;
    }
    const unit = unitFromHeaderToken(m[1]!);
    if (unit) {
      return unit;
    }
  }
  return undefined;
}

type SetColumnPair = { index: number; repsField: string; weightField: string };

/**
 * Pair `Set N (Reps)` with `Set N (<unit>)` from the header row.
 * Supports more than 5 sets if StrongLifts adds columns later.
 */
function findSetColumns(fields: string[]): SetColumnPair[] {
  const repsByIndex = new Map<number, string>();
  const weightByIndex = new Map<number, string>();

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
        weightByIndex.set(Number(weightMatch[1]), field);
      }
    }
  }

  const indices = [...new Set([...repsByIndex.keys(), ...weightByIndex.keys()])].sort((a, b) => a - b);
  const pairs: SetColumnPair[] = [];
  for (const index of indices) {
    const repsField = repsByIndex.get(index);
    const weightField = weightByIndex.get(index);
    if (repsField && weightField) {
      pairs.push({ index, repsField, weightField });
    }
  }
  return pairs;
}

/** StrongLifts dates are `yyyy/mm/dd`. */
function parseStrongLiftsDate(raw: string): LocalDate | undefined {
  const trimmed = raw.trim();
  const slash = trimmed.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
  if (slash) {
    try {
      return LocalDate.of(Number(slash[1]), Number(slash[2]), Number(slash[3]));
    } catch {
      return undefined;
    }
  }
  try {
    return LocalDate.parse(trimmed);
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
  const text = csvText.replace(/^\uFEFF/, '').trim();
  if (!text) {
    return { ok: false, error: 'CSV is empty' };
  }

  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });

  if (parsed.errors.length > 0 && (!parsed.data || parsed.data.length === 0)) {
    return { ok: false, error: parsed.errors[0]?.message ?? 'Failed to parse CSV' };
  }

  const fields = parsed.meta.fields?.map((f) => f.trim()) ?? [];
  const missing = REQUIRED_HEADERS.filter(
    (h) => !fields.some((f) => f.toLowerCase() === h.toLowerCase()),
  );
  if (missing.length > 0) {
    // Also accept a bare `Date` header if StrongLifts ever drops the format hint.
    const hasDate =
      fields.some((f) => f.toLowerCase() === 'date') ||
      fields.some((f) => f.toLowerCase().startsWith('date'));
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

  const weightUnit = detectWeightUnit(fields) ?? 'kilograms';
  const rows: StrongLiftsCsvRow[] = [];

  for (const raw of parsed.data) {
    if (!raw || typeof raw !== 'object') {
      continue;
    }
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
      programName: cell(raw, 'Program Name'),
      bodyWeight: parseOptionalNumber(cell(raw, 'Body Weight (KG)', 'Body Weight (LB)', 'Body Weight')),
      exercise,
      notes: cell(raw, 'Notes'),
      sets,
    });
  }

  if (rows.length === 0) {
    return { ok: false, error: 'No workout rows found in CSV' };
  }

  return { ok: true, rows, weightUnit };
}

/**
 * Map StrongLifts rows to sessions.
 * Grouping key: calendar date + Workout number (multiple workouts per day stay separate).
 */
export function strongLiftsRowsToSessions(
  rows: StrongLiftsCsvRow[],
  weightUnit: WeightUnit,
  options: CsvImportOptions = {},
): Session[] {
  // Unit is encoded in StrongLifts headers (e.g. Set 1 (KG)); prefer that over app preference.
  const unit = weightUnit !== 'nil' ? weightUnit : (options.defaultWeightUnit ?? 'kilograms');

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

  const sessions: Session[] = [];
  const sortedKeys = [...groups.keys()].sort();

  for (const key of sortedKeys) {
    const group = groups.get(key)!;
    const sessionName =
      group.workoutName ||
      (group.workout ? `Workout ${group.workout}` : undefined) ||
      options.sessionName ||
      'Imported';

    const recordedExercises: RecordedWeightedExercise[] = [];
    const idPayload: {
      name: string;
      notes: string | undefined;
      sets: { reps: number; weight: number; unit: WeightUnit }[];
    }[] = [];
    let setOrdinal = 0;

    // Preserve first-seen exercise order; merge duplicate exercise names in order of appearance.
    const exerciseOrder: string[] = [];
    const byExercise = new Map<string, StrongLiftsCsvRow[]>();
    for (const row of group.exercises) {
      if (!byExercise.has(row.exercise)) {
        exerciseOrder.push(row.exercise);
        byExercise.set(row.exercise, []);
      }
      byExercise.get(row.exercise)!.push(row);
    }

    for (const exerciseName of exerciseOrder) {
      const exerciseRows = byExercise.get(exerciseName)!;
      const allSets = exerciseRows.flatMap((r) => r.sets);
      if (allSets.length === 0) {
        continue;
      }
      const noteParts = exerciseRows.map((r) => r.notes.trim()).filter(Boolean);
      const notes = noteParts.length > 0 ? noteParts.join('\n') : undefined;
      const firstReps = allSets[0]?.reps ?? 10;
      const blueprint = WeightedExerciseBlueprint.empty().with({
        name: exerciseName,
        sets: allSets.length,
        repsConfig: { type: 'fixed', reps: firstReps },
      });

      const setsForId: { reps: number; weight: number; unit: WeightUnit }[] = [];
      const potentialSets = allSets.map((set) => {
        setsForId.push({ reps: set.reps, weight: set.weight, unit });
        const completionDateTime = group.date
          .atTime(LocalTime.of(12, 0, 0))
          .atOffset(ZoneOffset.UTC)
          .plusSeconds(setOrdinal);
        setOrdinal += 1;
        return new PotentialSet(
          new RecordedSet(set.reps, completionDateTime),
          new Weight(set.weight, unit),
        );
      });

      idPayload.push({ name: exerciseName, notes, sets: setsForId });
      recordedExercises.push(new RecordedWeightedExercise(blueprint, potentialSets, notes));
    }

    if (recordedExercises.length === 0) {
      continue;
    }

    const sessionBlueprint = new SessionBlueprint(
      sessionName,
      recordedExercises.map((e) => e.blueprint),
      '',
    );

    const bodyweight =
      group.bodyWeight !== undefined ? new Weight(group.bodyWeight, unit) : undefined;

    // Include workout id in the content key so A/B on the same day get distinct stable ids.
    const contentDateKey = `${group.dateKey}|w${group.workout || '0'}`;
    sessions.push(
      new Session(
        sessionIdFromCsvContent(contentDateKey, idPayload),
        sessionBlueprint,
        recordedExercises,
        group.date,
        bodyweight,
        undefined,
      ),
    );
  }

  return sessions;
}
