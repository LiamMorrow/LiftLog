import { importBackupData, importFromExternal } from '@/store/settings';
import { addImportExternalEffects } from '@/store/settings/import-external-effects';
import { getImportForFitNotes, getImportForStrongLifts } from '@/services/csv-import';
import { createAddEffectTestBed } from '@/utils/__test__/add-effect-testbed';
import { describe, expect, it, vi } from 'vitest';
import { showSnackbar } from '@/store/app';
import { setStatsIsDirty } from '@/store/stats';

const sampleCsv = `Date,Exercise,Category,Weight,Weight Unit,Reps,Distance,Distance Unit,Time,Comment
2026-08-08,Bench Press,Chest,60,kgs,8,,,,
2026-08-08,Squat,Legs,100,kgs,5,,,,
`;

const sampleStrongLiftsCsv = `Date (yyyy/mm/dd),Workout,Workout Name,Program Name,Body Weight (KG),Exercise,Notes,Set 1 (Reps),Set 1 (KG),Set 2 (Reps),Set 2 (KG)
2026/08/11,1,"Workout A","Stronglifts 5×5",83.5,"Squat","",5,55,5,55
2026/08/11,1,"Workout A","Stronglifts 5×5",83.5,"Bench Press","",5,70,5,70
`;

describe('import-external-effects', () => {
  it('picks a CSV and dispatches importBackupData with FitNotes-shaped BackupData', async () => {
    const testBed = createAddEffectTestBed({
      initialState: {
        settings: { useImperialUnits: false },
        storedSessions: { sessions: {} },
      },
      services: {
        filePickerService: {
          pickFile: vi.fn().mockResolvedValue({
            name: 'workout_export.csv',
            bytes: new TextEncoder().encode(sampleCsv),
          }),
        },
        tolgee: {
          t: (key: string, params?: { count?: number; error?: string }) => {
            if (key === 'backup.import_from_other_apps.complete.message') {
              return `Imported ${params?.count} workout(s)`;
            }
            return key;
          },
        },
      },
    });

    addImportExternalEffects(testBed.addEffect);
    await testBed.dispatchHandled(importFromExternal({ format: 'CSV' }));

    const imported = testBed.getDispatchedAction(importBackupData);
    expect(imported.payload.workouts).toHaveLength(1);
    expect(imported.payload.workouts[0]!.date.toString()).toBe('2026-08-08');
    expect(imported.payload.workouts[0]!.recordedExercises).toHaveLength(2);
    expect(imported.payload.programs).toEqual({});
    expect(imported.payload.successMessage).toBe('Imported 1 workout(s)');

    expect(testBed.getDispatchedAction(setStatsIsDirty).payload).toBe(true);
  });

  it('skips import when all sessions from the file already exist', async () => {
    const backup = getImportForFitNotes(new TextEncoder().encode(sampleCsv));
    const existing = Object.fromEntries(backup.workouts.map((w) => [w.id, w]));

    const testBed = createAddEffectTestBed({
      initialState: {
        settings: { useImperialUnits: false },
        storedSessions: { sessions: existing },
      },
      services: {
        filePickerService: {
          pickFile: vi.fn().mockResolvedValue({
            name: 'workout_export.csv',
            bytes: new TextEncoder().encode(sampleCsv),
          }),
        },
        tolgee: {
          t: (key: string) => {
            if (key === 'backup.import_from_other_apps.already_imported.message') {
              return 'Those workouts are already in History';
            }
            return key;
          },
        },
      },
    });

    addImportExternalEffects(testBed.addEffect);
    await testBed.dispatchHandled(importFromExternal({ format: 'CSV' }));

    expect(() => testBed.getDispatchedAction(importBackupData)).toThrow();
    expect(() => testBed.getDispatchedAction(setStatsIsDirty)).toThrow();
    expect(testBed.getDispatchedAction(showSnackbar).payload.text).toBe(
      'Those workouts are already in History',
    );
  });

  it('imports only sessions not already in History', async () => {
    const multiDayCsv = `Date,Exercise,Category,Weight,Weight Unit,Reps,Distance,Distance Unit,Time,Comment
2026-08-07,Bench Press,Chest,60,kgs,8,,,,
2026-08-08,Squat,Legs,100,kgs,5,,,,
`;
    const all = getImportForFitNotes(new TextEncoder().encode(multiDayCsv));
    const firstOnly = Object.fromEntries([[all.workouts[0]!.id, all.workouts[0]!]]);

    const testBed = createAddEffectTestBed({
      initialState: {
        settings: { useImperialUnits: false },
        storedSessions: { sessions: firstOnly },
      },
      services: {
        filePickerService: {
          pickFile: vi.fn().mockResolvedValue({
            name: 'workout_export.csv',
            bytes: new TextEncoder().encode(multiDayCsv),
          }),
        },
        tolgee: {
          t: (key: string, params?: { count?: number }) => {
            if (key === 'backup.import_from_other_apps.complete.message') {
              return `Imported ${params?.count} workout(s)`;
            }
            return key;
          },
        },
      },
    });

    addImportExternalEffects(testBed.addEffect);
    await testBed.dispatchHandled(importFromExternal({ format: 'CSV' }));

    const imported = testBed.getDispatchedAction(importBackupData);
    expect(imported.payload.workouts).toHaveLength(1);
    expect(imported.payload.workouts[0]!.id).toBe(all.workouts[1]!.id);
    expect(imported.payload.successMessage).toBe('Imported 1 workout(s)');
  });

  it('shows an error snackbar for invalid CSV and does not import', async () => {
    const testBed = createAddEffectTestBed({
      initialState: {
        settings: { useImperialUnits: false },
        storedSessions: { sessions: {} },
      },
      services: {
        filePickerService: {
          pickFile: vi.fn().mockResolvedValue({
            name: 'bad.csv',
            bytes: new TextEncoder().encode('not,a,valid,file\n1,2,3,4\n'),
          }),
        },
        tolgee: {
          t: (key: string, params?: { error?: string }) => {
            if (key === 'backup.import_from_other_apps.failed.message') {
              return `Could not import: ${params?.error}`;
            }
            return key;
          },
        },
      },
    });

    addImportExternalEffects(testBed.addEffect);
    await testBed.dispatchHandled(importFromExternal({ format: 'CSV' }));

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
    await testBed.dispatchHandled(importFromExternal({ format: 'CSV' }));

    expect(() => testBed.getDispatchedAction(importBackupData)).toThrow();
    expect(() => testBed.getDispatchedAction(showSnackbar)).toThrow();
  });

  it('picks a StrongLifts CSV and dispatches importBackupData', async () => {
    const testBed = createAddEffectTestBed({
      initialState: {
        settings: { useImperialUnits: false },
        storedSessions: { sessions: {} },
      },
      services: {
        filePickerService: {
          pickFile: vi.fn().mockResolvedValue({
            name: 'stronglifts.csv',
            bytes: new TextEncoder().encode(sampleStrongLiftsCsv),
          }),
        },
        tolgee: {
          t: (key: string, params?: { count?: number; error?: string }) => {
            if (key === 'backup.import_from_other_apps.complete.message') {
              return `Imported ${params?.count} workout(s)`;
            }
            return key;
          },
        },
      },
    });

    addImportExternalEffects(testBed.addEffect);
    await testBed.dispatchHandled(importFromExternal({ format: 'StrongLifts' }));

    const imported = testBed.getDispatchedAction(importBackupData);
    expect(imported.payload.workouts).toHaveLength(1);
    expect(imported.payload.workouts[0]!.blueprint.name).toBe('Workout A');
    expect(imported.payload.workouts[0]!.recordedExercises).toHaveLength(2);
    expect(imported.payload.programs).toEqual({});
    expect(imported.payload.successMessage).toBe('Imported 1 workout(s)');
    expect(testBed.getDispatchedAction(setStatsIsDirty).payload).toBe(true);
  });

  it('skips StrongLifts sessions already present in History', async () => {
    const backup = getImportForStrongLifts(new TextEncoder().encode(sampleStrongLiftsCsv));
    const existing = Object.fromEntries(backup.workouts.map((w) => [w.id, w]));

    const testBed = createAddEffectTestBed({
      initialState: {
        settings: { useImperialUnits: false },
        storedSessions: { sessions: existing },
      },
      services: {
        filePickerService: {
          pickFile: vi.fn().mockResolvedValue({
            name: 'stronglifts.csv',
            bytes: new TextEncoder().encode(sampleStrongLiftsCsv),
          }),
        },
        tolgee: {
          t: (key: string) => {
            if (key === 'backup.import_from_other_apps.already_imported.message') {
              return 'Those workouts are already in History';
            }
            return key;
          },
        },
      },
    });

    addImportExternalEffects(testBed.addEffect);
    await testBed.dispatchHandled(importFromExternal({ format: 'StrongLifts' }));

    expect(() => testBed.getDispatchedAction(importBackupData)).toThrow();
    expect(testBed.getDispatchedAction(showSnackbar).payload.text).toBe(
      'Those workouts are already in History',
    );
  });
});
