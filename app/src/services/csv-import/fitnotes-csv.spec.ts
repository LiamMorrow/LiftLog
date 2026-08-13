import { describe, expect, it } from 'vitest';
import { getImportForFitNotes } from '@/services/csv-import';
import { parseFitNotesCsv } from '@/services/csv-import/fitnotes-csv';
import { RecordedWeightedExercise, Session } from '@/models/session-models';

const sampleFitNotesCsv = `Date,Exercise,Category,Weight,Weight Unit,Reps,Distance,Distance Unit,Time,Comment

2026-08-08,Incline Dumbbell Bench Press,Chest,12.5,kgs,12,,,,""
2026-08-08,Incline Dumbbell Bench Press,Chest,40.0,kgs,12,,,,""
2026-08-08,Incline Dumbbell Bench Press,Chest,35.0,kgs,12,,,,""
2026-08-08,Incline Dumbbell Bench Press,Chest,25.0,kgs,8,,,,"Dropset incomplete"
2026-08-08,EZ-Bar Preacher Curl,Biceps,15.0,kgs,10,,,,""
2026-08-08,EZ-Bar Preacher Curl,Biceps,30.0,kgs,8,,,,""
2026-08-08,EZ-Bar Preacher Curl,Biceps,40.0,kgs,6,,,,""
2026-08-08,EZ-Bar Preacher Curl,Biceps,30.0,kgs,3,,,,"Dropset"
2026-08-08,EZ-Bar Preacher Curl,Biceps,20.0,kgs,2,,,,"Dropset 2"
2026-08-08,Lateral Dumbbell Raise,Shoulders,10.0,kgs,10,,,,""
2026-08-08,Lateral Dumbbell Raise,Shoulders,10.0,kgs,8,,,,""
2026-08-08,Barbell Squat,Legs,20.0,kgs,10,,,,""
2026-08-08,Barbell Squat,Legs,60.0,kgs,10,,,,""
2026-08-08,Barbell Squat,Legs,100.0,kgs,5,,,,""
`;

function importSample(csv: string = sampleFitNotesCsv) {
  return getImportForFitNotes(new TextEncoder().encode(csv));
}

describe('parseFitNotesCsv', () => {
  it('parses a FitNotes-style CSV export', () => {
    const result = parseFitNotesCsv(sampleFitNotesCsv);
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.rows).toHaveLength(14);
    expect(result.rows[0]).toMatchObject({
      date: '2026-08-08',
      exercise: 'Incline Dumbbell Bench Press',
      weight: 12.5,
      weightUnit: 'kgs',
      reps: 12,
    });
    expect(result.rows.find((r) => r.comment === 'Dropset incomplete')).toBeDefined();
  });

  it('rejects CSV with unexpected headers', () => {
    const result = parseFitNotesCsv('SessionId,Timestamp,Exercise\na,b,c\n');
    expect(result.ok).toBe(false);
  });
});

describe('getImportForFitNotes', () => {
  it('builds one Session for the day with four exercises', () => {
    const backup = importSample();
    expect(backup.workouts).toHaveLength(1);
    const session = backup.workouts[0]!;
    expect(session.date.toString()).toBe('2026-08-08');
    expect(session.blueprint.name).toBe('Imported from FitNotes');
    expect(session.recordedExercises).toHaveLength(4);

    const names = session.recordedExercises.map((e) => e.blueprint.name);
    expect(names).toEqual([
      'Incline Dumbbell Bench Press',
      'EZ-Bar Preacher Curl',
      'Lateral Dumbbell Raise',
      'Barbell Squat',
    ]);

    const bench = session.recordedExercises[0] as RecordedWeightedExercise;
    expect(bench.potentialSets).toHaveLength(4);
    expect(bench.potentialSets[0]!.weight.unit).toBe('kilograms');
    expect(bench.potentialSets[0]!.weight.value.toNumber()).toBe(12.5);
    expect(bench.potentialSets[0]!.set?.repsCompleted).toBe(12);
    expect(bench.notes).toContain('Dropset incomplete');

    const curls = session.recordedExercises[1] as RecordedWeightedExercise;
    expect(curls.potentialSets).toHaveLength(5);
    expect(curls.notes).toContain('Dropset');
    expect(curls.notes).toContain('Dropset 2');

    const squat = session.recordedExercises[3] as RecordedWeightedExercise;
    expect(squat.potentialSets).toHaveLength(3);
    expect(squat.potentialSets[2]!.weight.value.toNumber()).toBe(100);
    expect(squat.potentialSets[2]!.set?.repsCompleted).toBe(5);
  });

  it('round-trips through Session.toJSON / fromJSON', () => {
    const session = importSample().workouts[0]!;
    const json = session.toJSON();
    expect(json.version).toBe(4);
    const rebuilt = Session.fromJSON(json);
    expect(rebuilt.date.toString()).toBe('2026-08-08');
    expect(rebuilt.recordedExercises).toHaveLength(4);
    expect(rebuilt.equals(session)).toBe(true);
  });

  it('groups multiple dates into multiple sessions', () => {
    const csv = `Date,Exercise,Category,Weight,Weight Unit,Reps,Distance,Distance Unit,Time,Comment
2026-08-07,Bench Press,Chest,60,kgs,8,,,,
2026-08-08,Squat,Legs,100,kgs,5,,,,
`;
    const backup = importSample(csv);
    expect(backup.workouts).toHaveLength(2);
    expect(backup.workouts.map((s) => s.date.toString())).toEqual(['2026-08-07', '2026-08-08']);
  });

  it('assigns the same session id for identical CSV content', () => {
    const a = importSample();
    const b = importSample();
    expect(a.workouts[0]!.id).toBe(b.workouts[0]!.id);
  });

  it('keeps the same session id when sets or notes on that day change', () => {
    const base = `Date,Exercise,Category,Weight,Weight Unit,Reps,Distance,Distance Unit,Time,Comment
2026-08-08,Bench Press,Chest,60,kgs,8,,,,
`;
    const changedSets = `Date,Exercise,Category,Weight,Weight Unit,Reps,Distance,Distance Unit,Time,Comment
2026-08-08,Bench Press,Chest,65,kgs,8,,,,
`;
    const changedNotes = `Date,Exercise,Category,Weight,Weight Unit,Reps,Distance,Distance Unit,Time,Comment
2026-08-08,Bench Press,Chest,60,kgs,8,,,,"felt easy"
`;
    const baseId = importSample(base).workouts[0]!.id;
    expect(importSample(changedSets).workouts[0]!.id).toBe(baseId);
    expect(importSample(changedNotes).workouts[0]!.id).toBe(baseId);
  });

  it('normalizes weight unit aliases into the same session id', () => {
    const kgs = `Date,Exercise,Category,Weight,Weight Unit,Reps,Distance,Distance Unit,Time,Comment
2026-08-08,Bench Press,Chest,60,kgs,8,,,,
`;
    const kg = `Date,Exercise,Category,Weight,Weight Unit,Reps,Distance,Distance Unit,Time,Comment
2026-08-08,Bench Press,Chest,60,kg,8,,,,
`;
    expect(importSample(kgs).workouts[0]!.id).toBe(importSample(kg).workouts[0]!.id);
  });

  it('returns BackupData with workouts and empty programs', () => {
    const backup = importSample();
    expect(backup.workouts).toHaveLength(1);
    expect(backup.workouts[0]!.recordedExercises).toHaveLength(4);
    expect(backup.programs).toEqual({});
    expect(backup.feed).toBeUndefined();
  });

  it('throws on invalid CSV', () => {
    expect(() => importSample('not,valid\n1,2\n')).toThrow(/Missing CSV columns/);
  });
});
