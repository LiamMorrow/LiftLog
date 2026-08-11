import { SessionBlueprint, WeightedExerciseBlueprint } from '@/models/blueprint-models';
import {
  PotentialSet,
  RecordedSet,
  RecordedWeightedExercise,
  Session,
} from '@/models/session-models';
import { Weight, WeightUnit } from '@/models/weight';
import { uuidFromName } from '@/utils/uuid';
import { LocalDate, LocalTime, ZoneOffset } from '@js-joda/core';
import { WorkoutCsvRow } from '@/services/csv-import/workout-csv';

export type CsvImportOptions = {
  /** Fallback unit when a row's Weight Unit is missing/unknown. */
  defaultWeightUnit?: WeightUnit;
  /** Session blueprint name prefix. Default: "Imported from FitNotes". */
  sessionName?: string;
};

/**
 * Namespace for UUID v5 session IDs from third-party CSV imports.
 * Same CSV content → same session id → re-import upserts instead of duplicating.
 */
export const CSV_IMPORT_SESSION_NAMESPACE = 'a7f3c8e2-4b1d-5e9a-8c2f-1d0e9b7a6c5f';

/**
 * Stable id from date + ordered exercises/sets (normalized weight unit, reps, weight, notes).
 * Synthetic completion timestamps are omitted — they are derived from set order only.
 */
export function sessionIdFromCsvContent(
  dateKey: string,
  exercises: {
    name: string;
    notes: string | undefined;
    sets: { reps: number; weight: number; unit: WeightUnit }[];
  }[],
): string {
  const parts: string[] = ['csv-import-v1', dateKey];
  for (const ex of exercises) {
    parts.push(ex.name);
    parts.push(ex.notes ?? '');
    for (const set of ex.sets) {
      parts.push(`${set.reps}|${set.weight}|${set.unit}`);
    }
  }
  return uuidFromName(parts.join('\n'), CSV_IMPORT_SESSION_NAMESPACE);
}

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

/** Weighted set rows only; cardio-only rows are skipped in v1. */
function isWeightedSetRow(row: WorkoutCsvRow): boolean {
  return row.reps !== undefined && row.weight !== undefined;
}

/**
 * Group workout CSV rows into LiftLog Session domain objects.
 * Grouping key: calendar date only (export format has no workout id).
 * Session ids are content-derived (date + sets) so re-importing the same rows is a no-op
 * when filtered against existing History; new/changed set content gets a new id.
 */
export function csvRowsToSessions(rows: WorkoutCsvRow[], options: CsvImportOptions = {}): Session[] {
  const defaultWeightUnit = options.defaultWeightUnit ?? 'kilograms';
  const sessionName = options.sessionName ?? 'Imported from FitNotes';

  const byDate = new Map<string, WorkoutCsvRow[]>();
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

  const sessions: Session[] = [];
  const sortedDates = [...byDate.keys()].sort();

  for (const dateKey of sortedDates) {
    const dayRows = byDate.get(dateKey)!;
    const date = parseLocalDate(dateKey)!;

    // Preserve first-seen exercise order within the day.
    const exerciseOrder: string[] = [];
    const byExercise = new Map<string, WorkoutCsvRow[]>();
    for (const row of dayRows) {
      if (!byExercise.has(row.exercise)) {
        exerciseOrder.push(row.exercise);
        byExercise.set(row.exercise, []);
      }
      byExercise.get(row.exercise)!.push(row);
    }

    const recordedExercises: RecordedWeightedExercise[] = [];
    const idPayload: {
      name: string;
      notes: string | undefined;
      sets: { reps: number; weight: number; unit: WeightUnit }[];
    }[] = [];
    let setOrdinal = 0;

    for (const exerciseName of exerciseOrder) {
      const setRows = byExercise.get(exerciseName)!;
      const setCount = setRows.length;
      const firstReps = setRows[0]?.reps ?? 10;
      const blueprint = WeightedExerciseBlueprint.empty().with({
        name: exerciseName,
        sets: setCount,
        repsConfig: { type: 'fixed', reps: firstReps },
      });

      const comments = setRows
        .map((r, i) => {
          const c = r.comment.trim();
          return c ? `Set ${i + 1}: ${c}` : undefined;
        })
        .filter((c): c is string => !!c);
      const notes = comments.length > 0 ? comments.join('\n') : undefined;

      const setsForId: { reps: number; weight: number; unit: WeightUnit }[] = [];
      const potentialSets = setRows.map((row) => {
        const unit = mapWeightUnit(row.weightUnit, defaultWeightUnit);
        const reps = row.reps ?? 0;
        const weightValue = row.weight ?? 0;
        setsForId.push({ reps, weight: weightValue, unit });
        // Stable synthetic timestamps: noon UTC + 1s per set so history ordering is deterministic.
        const completionDateTime = date
          .atTime(LocalTime.of(12, 0, 0))
          .atOffset(ZoneOffset.UTC)
          .plusSeconds(setOrdinal);
        setOrdinal += 1;
        return new PotentialSet(new RecordedSet(reps, completionDateTime), new Weight(weightValue, unit));
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

    sessions.push(
      new Session(
        sessionIdFromCsvContent(dateKey, idPayload),
        sessionBlueprint,
        recordedExercises,
        date,
        undefined,
        undefined,
      ),
    );
  }

  return sessions;
}
