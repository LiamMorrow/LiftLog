import { describe, expect, it } from 'vitest';
import { getImportForFitNotes } from '@/services/csv-import';
import { parseFitNotesCsv } from '@/services/csv-import/fitnotes-csv';
import { csvImportFixtureBytes, readCsvImportFixture } from '@/services/csv-import/__test__/fixtures';
import { RecordedWeightedExercise, Session } from '@/models/session-models';

function importSample(csv?: string) {
  return getImportForFitNotes(
    csv !== undefined ? new TextEncoder().encode(csv) : csvImportFixtureBytes('fitnotes-android-export-kgs.csv'),
  );
}

describe('parseFitNotesCsv', () => {
  it('parses a FitNotes-style CSV export', () => {
    const result = parseFitNotesCsv(readCsvImportFixture('fitnotes-android-export-kgs.csv'));
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.rows).toHaveLength(38);
    expect(result.rows[0]).toMatchObject({
      date: '2026-08-04',
      exercise: 'Lat Pulldown',
      weight: 35,
      weightUnit: 'kgs',
      reps: 10,
    });
    expect(result.rows.find((r) => r.comment === 'testing note 1')).toBeDefined();
    expect(result.rows.find((r) => r.comment === 'testing note 2')).toBeDefined();
  });

  it('rejects CSV with unexpected headers', () => {
    const result = parseFitNotesCsv('SessionId,Timestamp,Exercise\na,b,c\n');
    expect(result.ok).toBe(false);
  });
});

describe('getImportForFitNotes', () => {
  it('builds one Session per day with exercises grouped across non-contiguous rows', () => {
    const backup = importSample();
    expect(backup.workouts).toHaveLength(2);

    const day04 = backup.workouts[0]!;
    expect(day04.date.toString()).toBe('2026-08-04');
    expect(day04.blueprint.name).toBe('Imported from FitNotes');
    expect(day04.recordedExercises.map((e) => e.blueprint.name)).toEqual([
      'Lat Pulldown',
      'Machine Triceps Pushdown',
      'Hammer Strength Row',
      'Lateral Machine Raise',
      'Hip Thrust',
    ]);

    const latPulldown = day04.recordedExercises[0] as RecordedWeightedExercise;
    expect(latPulldown.potentialSets).toHaveLength(6);
    expect(latPulldown.potentialSets[0]!.weight.unit).toBe('kilograms');
    expect(latPulldown.potentialSets[0]!.weight.value.toNumber()).toBe(35);
    expect(latPulldown.potentialSets[0]!.set?.repsCompleted).toBe(10);

    const row = day04.recordedExercises[2] as RecordedWeightedExercise;
    expect(row.notes).toContain('testing note 1');

    const day05 = backup.workouts[1]!;
    expect(day05.date.toString()).toBe('2026-08-05');
    expect(day05.recordedExercises.map((e) => e.blueprint.name)).toEqual([
      'Bigger Incline Dumbbell Bench Press',
      'Smith Machine Shoulder Press',
      'Seated Machine Fly',
    ]);

    const smith = day05.recordedExercises[1] as RecordedWeightedExercise;
    expect(smith.potentialSets).toHaveLength(3);

    const fly = day05.recordedExercises[2] as RecordedWeightedExercise;
    expect(fly.notes).toContain('testing note 2');
  });

  it('round-trips through Session.toJSON / fromJSON', () => {
    const session = importSample().workouts[0]!;
    const json = session.toJSON();
    expect(json.version).toBe(4);
    const rebuilt = Session.fromJSON(json);
    expect(rebuilt.date.toString()).toBe('2026-08-04');
    expect(rebuilt.recordedExercises).toHaveLength(5);
    expect(rebuilt.equals(session)).toBe(true);
  });

  it('groups multiple dates into multiple sessions', () => {
    const backup = importSample();
    expect(backup.workouts.map((s) => s.date.toString())).toEqual(['2026-08-04', '2026-08-05']);
  });

  it('assigns the same session id for identical CSV content', () => {
    const a = importSample();
    const b = importSample();
    expect(a.workouts[0]!.id).toBe(b.workouts[0]!.id);
    expect(a.workouts[1]!.id).toBe(b.workouts[1]!.id);
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

  it('reads lbs as pounds', () => {
    const backup = getImportForFitNotes(csvImportFixtureBytes('fitnotes-android-export-lbs.csv'));
    const latPulldown = backup.workouts[0]!.recordedExercises[0] as RecordedWeightedExercise;
    expect(latPulldown.potentialSets[0]!.weight.unit).toBe('pounds');
    expect(latPulldown.potentialSets[0]!.weight.value.toNumber()).toBe(77.16);
  });

  it('returns BackupData with workouts and empty programs', () => {
    const backup = importSample();
    expect(backup.workouts).toHaveLength(2);
    expect(backup.workouts[0]!.recordedExercises).toHaveLength(5);
    expect(backup.programs).toEqual({});
    expect(backup.feed).toBeUndefined();
  });

  it('throws on invalid CSV', () => {
    expect(() => importSample('not,valid\n1,2\n')).toThrow(/Missing CSV columns/);
  });
});
