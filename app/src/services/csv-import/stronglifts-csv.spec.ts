import { describe, expect, it } from 'vitest';
import { getImportForStrongLifts } from '@/services/csv-import';
import { parseStrongLiftsCsv } from '@/services/csv-import/stronglifts-csv';
import { RecordedWeightedExercise, Session } from '@/models/session-models';

/** Excerpt shaped like a real StrongLifts export (see tests/csv-import-test-files/). */
const sampleStrongLiftsCsv = `Date (yyyy/mm/dd),Workout,Workout Name,Program Name,Body Weight (KG),Exercise,Sets×Reps,Sets×Time,Top Set (Reps×KG),e1RM (KG),Reps,Volume (KG),Workout Volume (KG),Duration (hours),Start Time (h:mm),End Time (h:mm),Notes,Set 1 (Reps),Set 1 (KG),Set 2 (Reps),Set 2 (KG),Set 3 (Reps),Set 3 (KG),Set 4 (Reps),Set 4 (KG),Set 5 (Reps),Set 5 (KG)
2026/08/11,1,"Workout A","Stronglifts 5×5",83.5,"Squat",5/5/5/5/-,,5×55,63.7,20,1100,3330.0,0.0094444,10:56 PM,10:57 PM,"",5,55,5,55,5,55,5,55,0,55
2026/08/11,1,"Workout A","Stronglifts 5×5",83.5,"Bench Press",3/5/-/5/-,,3×70,75.9,13,910,3330.0,0.0094444,10:56 PM,10:57 PM,"",3,70,5,70,0,70,5,70,0,70
2026/08/11,1,"Workout A","Stronglifts 5×5",83.5,"Barbell Row",1/5/5/4/7,,1×60,60,22,1320,3330.0,0.0094444,10:56 PM,10:57 PM,"form note",1,60,5,60,5,60,4,60,7,60
2026/08/11,2,"Workout B","Stronglifts 5×5",83.5,"Squat",2/4/3/-/5,,2×55,57.5,14,770,1670.0,0.0086111,10:57 PM,10:57 PM,"",2,55,4,55,3,55,0,55,5,55
2026/08/11,2,"Workout B","Stronglifts 5×5",83.5,"Overhead Press",5/5/0/5/5,,5×30,34.7,20,600,1670.0,0.0086111,10:57 PM,10:57 PM,"",5,30,5,30,0,30,5,30,5,30
2026/08/11,2,"Workout B","Stronglifts 5×5",83.5,"Deadlift",1×4,,4×75,84,4,300,1670.0,0.0086111,10:57 PM,10:57 PM,"",4,75,,,,,,,,
`;

function importSample(csv: string = sampleStrongLiftsCsv) {
  return getImportForStrongLifts(new TextEncoder().encode(csv));
}

describe('parseStrongLiftsCsv', () => {
  it('parses exercise rows and expands set columns', () => {
    const result = parseStrongLiftsCsv(sampleStrongLiftsCsv);
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.weightUnit).toBe('kilograms');
    expect(result.rows).toHaveLength(6);
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
    expect(result.rows.find((r) => r.exercise === 'Barbell Row')?.notes).toBe('form note');
  });

  it('rejects FitNotes-shaped CSV', () => {
    const result = parseStrongLiftsCsv(
      'Date,Exercise,Category,Weight,Weight Unit,Reps\n2026-08-08,Squat,Legs,100,kgs,5\n',
    );
    expect(result.ok).toBe(false);
  });
});

describe('getImportForStrongLifts', () => {
  it('builds two sessions for A/B on the same day', () => {
    const backup = importSample();
    expect(backup.workouts).toHaveLength(2);
    expect(backup.workouts.map((s) => s.blueprint.name)).toEqual(['Workout A', 'Workout B']);
    expect(backup.workouts.every((s) => s.date.toString() === '2026-08-11')).toBe(true);

    const workoutA = backup.workouts[0]!;
    expect(workoutA.recordedExercises.map((e) => e.blueprint.name)).toEqual([
      'Squat',
      'Bench Press',
      'Barbell Row',
    ]);
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
    expect(row.notes).toBe('form note');
    expect(row.potentialSets).toHaveLength(5);

    const workoutB = backup.workouts[1]!;
    expect(workoutB.recordedExercises.map((e) => e.blueprint.name)).toEqual([
      'Squat',
      'Overhead Press',
      'Deadlift',
    ]);
    const deadlift = workoutB.recordedExercises[2] as RecordedWeightedExercise;
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
  });

  it('reads pounds from LB headers', () => {
    const csv = `Date (yyyy/mm/dd),Workout,Workout Name,Program Name,Body Weight (LB),Exercise,Notes,Set 1 (Reps),Set 1 (LB),Set 2 (Reps),Set 2 (LB)
2026/01/02,1,"Workout A","Stronglifts 5×5",180,"Squat","",5,135,5,135
`;
    const backup = importSample(csv);
    const squat = backup.workouts[0]!.recordedExercises[0] as RecordedWeightedExercise;
    expect(squat.potentialSets[0]!.weight.unit).toBe('pounds');
    expect(squat.potentialSets[0]!.weight.value.toNumber()).toBe(135);
    expect(backup.workouts[0]!.bodyweight?.unit).toBe('pounds');
  });

  it('returns BackupData with workouts and empty programs', () => {
    const backup = importSample();
    expect(backup.workouts).toHaveLength(2);
    expect(backup.programs).toEqual({});
    expect(backup.feed).toBeUndefined();
  });

  it('throws on invalid CSV', () => {
    expect(() => importSample('not,valid\n1,2\n')).toThrow(/Missing CSV columns/);
  });
});
