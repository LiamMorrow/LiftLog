import { SessionBlueprint, WeightedExerciseBlueprint } from '@/models/blueprint-models';
import { PotentialSet, RecordedSet, RecordedWeightedExercise, Session } from '@/models/session-models';
import { Weight, WeightUnit } from '@/models/weight';
import { uuidFromName } from '@/utils/uuid';
import { LocalDate, LocalTime, ZoneOffset } from '@js-joda/core';

export type CsvImportOptions = {
  /** Fallback unit when a row's Weight Unit is missing/unknown. */
  defaultWeightUnit?: WeightUnit;
  /** Session blueprint name when the format does not supply one. */
  sessionName?: string;
};

/**
 * Namespace for UUID v5 session IDs from third-party CSV imports.
 * Same CSV content → same session id → re-import upserts instead of duplicating.
 */
export const CSV_IMPORT_SESSION_NAMESPACE = 'a7f3c8e2-4b1d-5e9a-8c2f-1d0e9b7a6c5f';

export type NormalizedSet = { reps: number; weight: number; unit: WeightUnit };
export type NormalizedExercise = { name: string; notes?: string; sets: NormalizedSet[] };
export type NormalizedImportSession = {
  /** Content-id key (e.g. `2026-08-08` or `2026-08-08|w1` for SL A/B). */
  contentDateKey: string;
  date: LocalDate;
  sessionName: string;
  bodyweight?: Weight;
  exercises: NormalizedExercise[];
};

/**
 * Stable id from date + ordered exercises/sets (normalized weight unit, reps, weight, notes).
 * Synthetic completion timestamps are omitted — they are derived from set order only.
 * Notes are part of the payload: note-only edits in the source app yield a new session id.
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

/** Build Session domain objects from format-normalized import sessions. */
export function sessionsFromNormalized(sessions: NormalizedImportSession[]): Session[] {
  const result: Session[] = [];

  for (const normalized of sessions) {
    if (normalized.exercises.length === 0) {
      continue;
    }

    const recordedExercises: RecordedWeightedExercise[] = [];
    const idPayload: {
      name: string;
      notes: string | undefined;
      sets: { reps: number; weight: number; unit: WeightUnit }[];
    }[] = [];
    let setOrdinal = 0;

    for (const exercise of normalized.exercises) {
      if (exercise.sets.length === 0) {
        continue;
      }
      const firstReps = exercise.sets[0]?.reps ?? 10;
      const blueprint = WeightedExerciseBlueprint.empty().with({
        name: exercise.name,
        sets: exercise.sets.length,
        repsConfig: { type: 'fixed', reps: firstReps },
      });

      const setsForId: { reps: number; weight: number; unit: WeightUnit }[] = [];
      const potentialSets = exercise.sets.map((set) => {
        setsForId.push({ reps: set.reps, weight: set.weight, unit: set.unit });
        // Noon UTC + 1s per set: deterministic history order without real timestamps in CSV.
        const completionDateTime = normalized.date
          .atTime(LocalTime.of(12, 0, 0))
          .atOffset(ZoneOffset.UTC)
          .plusSeconds(setOrdinal);
        setOrdinal += 1;
        return new PotentialSet(new RecordedSet(set.reps, completionDateTime), new Weight(set.weight, set.unit));
      });

      idPayload.push({ name: exercise.name, notes: exercise.notes, sets: setsForId });
      recordedExercises.push(new RecordedWeightedExercise(blueprint, potentialSets, exercise.notes));
    }

    if (recordedExercises.length === 0) {
      continue;
    }

    const sessionBlueprint = new SessionBlueprint(
      normalized.sessionName,
      recordedExercises.map((e) => e.blueprint),
      '',
    );

    result.push(
      new Session(
        sessionIdFromCsvContent(normalized.contentDateKey, idPayload),
        sessionBlueprint,
        recordedExercises,
        normalized.date,
        normalized.bodyweight,
        undefined,
      ),
    );
  }

  return result;
}
