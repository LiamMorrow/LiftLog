import { describe, expect, it } from 'vitest';
import { getImportForStrongLifts } from '@/services/csv-import';
import { parseStrongLiftsCsv } from '@/services/csv-import/stronglifts-csv';
import { csvImportFixtureBytes, readCsvImportFixture } from '@/services/csv-import/__test__/fixtures';
import { RecordedWeightedExercise, Session } from '@/models/session-models';

function importSample(csv?: string) {
  return getImportForStrongLifts(
    csv !== undefined ? new TextEncoder().encode(csv) : csvImportFixtureBytes('stronglifts-export-kg.csv'),
  );
}

describe('parseStrongLiftsCsv', () => {
  it('parses exercise rows and expands set columns', () => {
    const result = parseStrongLiftsCsv(readCsvImportFixture('stronglifts-export-kg.csv'));
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.weightUnit).toBe('kilograms');
    expect(result.rows).toHaveLength(15);
    const squat = result.rows[0]!;
    expect(squat).toMatchObject({
      date: '2026/08/11',
      workout: '1',
      workoutName: 'Workout A',
      exercise: 'Squat',
      bodyWeight: 83.5,
    });
    // Skipped slot (0 reps) omitted → 4 sets
    expect(squat.sets).toEqual([
      { reps: 5, weight: 55 },
      { reps: 5, weight: 55 },
      { reps: 5, weight: 55 },
      { reps: 5, weight: 55 },
    ]);
    const deadlift = result.rows.find((r) => r.exercise === 'Deadlift');
    expect(deadlift?.sets).toEqual([{ reps: 4, weight: 75 }]);
  });

  it('rejects FitNotes-shaped CSV', () => {
    const result = parseStrongLiftsCsv(readCsvImportFixture('fitnotes-android-export-kgs.csv'));
    expect(result.ok).toBe(false);
  });
});

describe('getImportForStrongLifts', () => {
  it('builds a session per workout letter including Workout C', () => {
    const backup = importSample();
    expect(backup.workouts).toHaveLength(5);
    expect(backup.workouts.map((s) => s.blueprint.name)).toEqual([
      'Workout A',
      'Workout B',
      'Workout A',
      'Workout B',
      'Workout C',
    ]);

    const workoutA = backup.workouts[0]!;
    expect(workoutA.recordedExercises.map((e) => e.blueprint.name)).toEqual(['Squat', 'Bench Press', 'Barbell Row']);
    expect(workoutA.bodyweight?.value.toNumber()).toBe(83.5);
    expect(workoutA.bodyweight?.unit).toBe('kilograms');

    const squat = workoutA.recordedExercises[0] as RecordedWeightedExercise;
    expect(squat.potentialSets).toHaveLength(4);
    expect(squat.potentialSets[0]!.weight.value.toNumber()).toBe(55);
    expect(squat.potentialSets[0]!.set?.repsCompleted).toBe(5);

    const bench = workoutA.recordedExercises[1] as RecordedWeightedExercise;
    // 0-rep slots skipped → 3 sets (3, 5, 5)
    expect(bench.potentialSets).toHaveLength(3);
    expect(bench.potentialSets.map((s) => s.set?.repsCompleted)).toEqual([3, 5, 5]);

    const row = workoutA.recordedExercises[2] as RecordedWeightedExercise;
    expect(row.potentialSets).toHaveLength(5);

    const workoutC = backup.workouts[4]!;
    expect(workoutC.recordedExercises.map((e) => e.blueprint.name)).toEqual([
      'Front Squat',
      'Incline Bench Press',
      'Romanian Deadlift',
    ]);
    const rdl = workoutC.recordedExercises[2] as RecordedWeightedExercise;
    // Set 6 is 0 reps → omitted
    expect(rdl.potentialSets).toHaveLength(5);
  });

  it('keeps A and B on the same day as separate sessions', () => {
    const sameDay = importSample().workouts.filter((s) => s.date.toString() === '2026-08-11');
    expect(sameDay.map((s) => s.blueprint.name)).toEqual(['Workout A', 'Workout B']);
    expect(sameDay[1]!.recordedExercises.map((e) => e.blueprint.name)).toEqual(['Squat', 'Overhead Press', 'Deadlift']);
    const deadlift = sameDay[1]!.recordedExercises[2] as RecordedWeightedExercise;
    expect(deadlift.potentialSets).toHaveLength(1);
    expect(deadlift.potentialSets[0]!.weight.value.toNumber()).toBe(75);
    expect(deadlift.potentialSets[0]!.set?.repsCompleted).toBe(4);
  });

  it('round-trips through Session.toJSON / fromJSON', () => {
    const session = importSample().workouts[0]!;
    const rebuilt = Session.fromJSON(session.toJSON());
    expect(rebuilt.equals(session)).toBe(true);
  });

  it('assigns stable session ids for identical content', () => {
    const a = importSample();
    const b = importSample();
    expect(a.workouts[0]!.id).toBe(b.workouts[0]!.id);
    expect(a.workouts[1]!.id).toBe(b.workouts[1]!.id);
    expect(a.workouts[0]!.id).not.toBe(a.workouts[1]!.id);
    expect(a.workouts.map((w) => w.id)).toHaveLength(5);
    expect(new Set(a.workouts.map((w) => w.id)).size).toBe(5);
  });

  it('keeps the same session id when sets, notes, or workout name change', () => {
    const header = `Date (yyyy/mm/dd),Workout,Workout Name,Program Name,Body Weight (KG),Exercise,Notes,Set 1 (Reps),Set 1 (KG),Set 2 (Reps),Set 2 (KG)`;
    const base = `${header}
2026/08/11,1,"Workout A","Stronglifts 5×5",83.5,"Squat","",5,55,5,55
`;
    const changedSets = `${header}
2026/08/11,1,"Workout A","Stronglifts 5×5",83.5,"Squat","",5,60,5,60
`;
    const changedNotes = `${header}
2026/08/11,1,"Workout A","Stronglifts 5×5",83.5,"Squat","felt heavy",5,55,5,55
`;
    const renamed = `${header}
2026/08/11,1,"Heavy lower","Stronglifts 5×5",83.5,"Squat","",5,55,5,55
`;
    const baseId = importSample(base).workouts[0]!.id;
    expect(importSample(changedSets).workouts[0]!.id).toBe(baseId);
    expect(importSample(changedNotes).workouts[0]!.id).toBe(baseId);
    expect(importSample(renamed).workouts[0]!.id).toBe(baseId);
    expect(importSample(renamed).workouts[0]!.blueprint.name).toBe('Heavy lower');
  });

  it('reads pounds from LB set headers and kilograms from Body Weight (KG)', () => {
    const backup = getImportForStrongLifts(csvImportFixtureBytes('stronglifts-export-lb.csv'));
    const squat = backup.workouts[0]!.recordedExercises[0] as RecordedWeightedExercise;
    expect(squat.potentialSets[0]!.weight.unit).toBe('pounds');
    expect(squat.potentialSets[0]!.weight.value.toNumber()).toBe(121.3);
    expect(backup.workouts[0]!.bodyweight?.unit).toBe('kilograms');
    expect(backup.workouts[0]!.bodyweight?.value.toNumber()).toBe(83.5);
  });

  it('reads pounds from a Body Weight (LB) header', () => {
    const csv = `Date (yyyy/mm/dd),Workout,Workout Name,Program Name,Body Weight (LB),Exercise,Notes,Set 1 (Reps),Set 1 (LB),Set 2 (Reps),Set 2 (LB)
2026/01/02,1,"Workout A","Stronglifts 5×5",184,"Squat","",5,135,5,135
`;
    const backup = importSample(csv);
    const squat = backup.workouts[0]!.recordedExercises[0] as RecordedWeightedExercise;
    expect(squat.potentialSets[0]!.weight.unit).toBe('pounds');
    expect(squat.potentialSets[0]!.weight.value.toNumber()).toBe(135);
    expect(backup.workouts[0]!.bodyweight?.unit).toBe('pounds');
    expect(backup.workouts[0]!.bodyweight?.value.toNumber()).toBe(184);
  });

  it('returns BackupData with workouts and empty programs', () => {
    const backup = importSample();
    expect(backup.workouts).toHaveLength(5);
    expect(backup.programs).toEqual({});
    expect(backup.feed).toBeUndefined();
  });

  it('throws on invalid CSV', () => {
    expect(() => importSample('not,valid\n1,2\n')).toThrow(/Missing CSV columns/);
  });
});
