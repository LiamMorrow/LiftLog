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
 * Same grouping key → same session id → re-import skips instead of duplicating.
 */
export const CSV_IMPORT_SESSION_NAMESPACE = 'a7f3c8e2-4b1d-5e9a-8c2f-1d0e9b7a6c5f';

export type NormalizedSet = { reps: number; weight: number; unit: WeightUnit };
export type NormalizedExercise = { name: string; notes?: string; sets: NormalizedSet[] };
export type NormalizedImportSession = {
  /** Grouping key (FitNotes date, or StrongLifts `date|w{Workout}`). */
  contentDateKey: string;
  date: LocalDate;
  sessionName: string;
  bodyweight?: Weight;
  exercises: NormalizedExercise[];
};

/**
 * Stable id from the session grouping key only (not sets or notes).
 * First import wins; delete the session and import again to refresh.
 */
export function sessionIdFromCsvContent(dateKey: string): string {
  return uuidFromName(`csv-import-v1\n${dateKey}`, CSV_IMPORT_SESSION_NAMESPACE);
}

/** Build Session domain objects from format-normalized import sessions. */
export function sessionsFromNormalized(sessions: NormalizedImportSession[]): Session[] {
  const result: Session[] = [];

  for (const normalized of sessions) {
    if (normalized.exercises.length === 0) {
      continue;
    }

    const recordedExercises: RecordedWeightedExercise[] = [];
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

      const potentialSets = exercise.sets.map((set) => {
        // Noon UTC + 1s per set: deterministic history order without real timestamps in CSV.
        const completionDateTime = normalized.date
          .atTime(LocalTime.of(12, 0, 0))
          .atOffset(ZoneOffset.UTC)
          .plusSeconds(setOrdinal);
        setOrdinal += 1;
        return new PotentialSet(new RecordedSet(set.reps, completionDateTime), new Weight(set.weight, set.unit));
      });

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
        sessionIdFromCsvContent(normalized.contentDateKey),
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
