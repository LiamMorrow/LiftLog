import { importBackupData, importFromExternal, ExternalImportFormat } from '@/store/settings';
import { addImportExternalEffects } from '@/store/settings/import-external-effects';
import { getImportForFitNotes, getImportForStrongLifts } from '@/services/csv-import';
import { csvImportFixtureBytes } from '@/services/csv-import/__test__/fixtures';
import { createAddEffectTestBed } from '@/utils/__test__/add-effect-testbed';
import { describe, expect, it, vi } from 'vitest';
import { showSnackbar } from '@/store/app';
import { setStatsIsDirty } from '@/store/stats';
import { Session } from '@/models/session-models';

type BedOpts = {
  format: ExternalImportFormat;
  bytes: Uint8Array;
  sessions?: Record<string, Session>;
  imperial?: boolean;
  tolgee?: (key: string, params?: { count?: number; error?: string }) => string;
};

function makeExternalImportBed({ format: _format, bytes, sessions = {}, imperial = false, tolgee }: BedOpts) {
  const defaultTolgee = (key: string, params?: { count?: number; error?: string }) => {
    if (key === 'backup.import_from_other_apps.complete.message') {
      return `Imported ${params?.count} workout(s)`;
    }
    if (key === 'backup.import_from_other_apps.already_imported.message') {
      return 'Those workouts are already in History';
    }
    if (key === 'backup.import_from_other_apps.failed.message') {
      return `Could not import: ${params?.error}`;
    }
    return key;
  };

  const testBed = createAddEffectTestBed({
    initialState: {
      settings: { useImperialUnits: imperial },
      storedSessions: { sessions },
    },
    services: {
      filePickerService: {
        pickFile: vi.fn().mockResolvedValue({
          name: 'import.csv',
          bytes,
        }),
      },
      tolgee: {
        t: tolgee ?? defaultTolgee,
      },
    },
  });
  addImportExternalEffects(testBed.addEffect);
  return testBed;
}

describe('import-external-effects', () => {
  it('picks a FitNotes CSV and dispatches importBackupData', async () => {
    const testBed = makeExternalImportBed({
      format: 'FitNotes',
      bytes: csvImportFixtureBytes('fitnotes-android-export-kgs.csv'),
    });
    await testBed.dispatchHandled(importFromExternal({ format: 'FitNotes' }));

    const imported = testBed.getDispatchedAction(importBackupData);
    expect(imported.payload.workouts).toHaveLength(2);
    expect(imported.payload.workouts[0]!.date.toString()).toBe('2026-08-04');
    expect(imported.payload.workouts[0]!.recordedExercises).toHaveLength(5);
    expect(imported.payload.programs).toEqual({});
    expect(imported.payload.successMessage).toBe('Imported 2 workout(s)');
    expect(testBed.getDispatchedAction(setStatsIsDirty).payload).toBe(true);
  });

  it.each([
    {
      name: 'FitNotes',
      format: 'FitNotes' as const,
      bytes: () => csvImportFixtureBytes('fitnotes-android-export-kgs.csv'),
      backup: () => getImportForFitNotes(csvImportFixtureBytes('fitnotes-android-export-kgs.csv')),
    },
    {
      name: 'StrongLifts',
      format: 'StrongLifts' as const,
      bytes: () => csvImportFixtureBytes('stronglifts-export-kg.csv'),
      backup: () => getImportForStrongLifts(csvImportFixtureBytes('stronglifts-export-kg.csv')),
    },
  ] as const)('skips import when all $name sessions already exist', async ({ format, bytes, backup }) => {
    const existing = Object.fromEntries(backup().workouts.map((w) => [w.id, w]));
    const testBed = makeExternalImportBed({ format, bytes: bytes(), sessions: existing });
    await testBed.dispatchHandled(importFromExternal({ format }));

    expect(() => testBed.getDispatchedAction(importBackupData)).toThrow();
    expect(() => testBed.getDispatchedAction(setStatsIsDirty)).toThrow();
    expect(testBed.getDispatchedAction(showSnackbar).payload.text).toBe('Those workouts are already in History');
  });

  it('skips a FitNotes day already in History even when sets changed', async () => {
    const original = `Date,Exercise,Category,Weight,Weight Unit,Reps,Distance,Distance Unit,Time,Comment
2026-08-08,Bench Press,Chest,60,kgs,8,,,,
`;
    const changedSets = `Date,Exercise,Category,Weight,Weight Unit,Reps,Distance,Distance Unit,Time,Comment
2026-08-08,Bench Press,Chest,65,kgs,8,,,,
`;
    const existing = Object.fromEntries(
      getImportForFitNotes(new TextEncoder().encode(original)).workouts.map((w) => [w.id, w]),
    );
    const testBed = makeExternalImportBed({
      format: 'FitNotes',
      bytes: new TextEncoder().encode(changedSets),
      sessions: existing,
    });
    await testBed.dispatchHandled(importFromExternal({ format: 'FitNotes' }));

    expect(() => testBed.getDispatchedAction(importBackupData)).toThrow();
    expect(testBed.getDispatchedAction(showSnackbar).payload.text).toBe('Those workouts are already in History');
  });

  it('imports only sessions not already in History', async () => {
    const all = getImportForFitNotes(csvImportFixtureBytes('fitnotes-android-export-kgs.csv'));
    const firstOnly = Object.fromEntries([[all.workouts[0]!.id, all.workouts[0]!]]);

    const testBed = makeExternalImportBed({
      format: 'FitNotes',
      bytes: csvImportFixtureBytes('fitnotes-android-export-kgs.csv'),
      sessions: firstOnly,
    });
    await testBed.dispatchHandled(importFromExternal({ format: 'FitNotes' }));

    const imported = testBed.getDispatchedAction(importBackupData);
    expect(imported.payload.workouts).toHaveLength(1);
    expect(imported.payload.workouts[0]!.id).toBe(all.workouts[1]!.id);
    expect(imported.payload.workouts[0]!.date.toString()).toBe('2026-08-05');
    expect(imported.payload.successMessage).toBe('Imported 1 workout(s)');
  });

  it('shows an error snackbar for invalid CSV and does not import', async () => {
    const testBed = makeExternalImportBed({
      format: 'FitNotes',
      bytes: new TextEncoder().encode('not,a,valid,file\n1,2,3,4\n'),
    });
    await testBed.dispatchHandled(importFromExternal({ format: 'FitNotes' }));

    expect(() => testBed.getDispatchedAction(importBackupData)).toThrow();
    expect(testBed.getDispatchedAction(showSnackbar).payload.text).toMatch(/Could not import:/);
  });

  it('no-ops when the user cancels the picker', async () => {
    const testBed = createAddEffectTestBed({
      services: {
        filePickerService: {
          pickFile: vi.fn().mockResolvedValue(undefined),
        },
        tolgee: { t: (s: string) => s },
      },
    });

    addImportExternalEffects(testBed.addEffect);
    await testBed.dispatchHandled(importFromExternal({ format: 'FitNotes' }));

    expect(() => testBed.getDispatchedAction(importBackupData)).toThrow();
    expect(() => testBed.getDispatchedAction(showSnackbar)).toThrow();
  });

  it('picks a StrongLifts CSV and dispatches importBackupData', async () => {
    const testBed = makeExternalImportBed({
      format: 'StrongLifts',
      bytes: csvImportFixtureBytes('stronglifts-export-kg.csv'),
    });
    await testBed.dispatchHandled(importFromExternal({ format: 'StrongLifts' }));

    const imported = testBed.getDispatchedAction(importBackupData);
    expect(imported.payload.workouts).toHaveLength(5);
    expect(imported.payload.workouts[0]!.blueprint.name).toBe('Workout A');
    expect(imported.payload.workouts[0]!.recordedExercises).toHaveLength(3);
    expect(imported.payload.programs).toEqual({});
    expect(imported.payload.successMessage).toBe('Imported 5 workout(s)');
    expect(testBed.getDispatchedAction(setStatsIsDirty).payload).toBe(true);
  });
});
