import { beginFeedImport, importBackupData, importData, importDataProto, importDataSql } from '@/store/settings';
import { addImportBackupEffects } from '@/store/settings/import-backup-effects';
import { createAddEffectTestBed } from '@/utils/__test__/add-effect-testbed';
import { describe, expect, it, vi } from 'vitest';
import { readFile } from 'node:fs/promises';
import { resolve } from 'path';
import { FeedBackupData } from '@/models/backup';
import { FeedIdentity } from '@/models/feed-models';
import { ProgramBlueprint } from '@/models/blueprint-models';
import { EmptySession, Session } from '@/models/session-models';
import { uuid } from '@/utils/uuid';
import { checkIfWeightMigrationRequired, upsertStoredSessions } from '@/store/stored-sessions';
import { upsertSavedPlans } from '@/store/program';
import { showSnackbar } from '@/store/app';

describe('import-backup-effects', () => {
  it('dispatches a valid import when the sqlite db is there', async () => {
    const realBytes = await readFile(resolve(__dirname, '../../utils/__test__/export.liftlogbackup.sqlite.gz'));
    const testBed = createAddEffectTestBed({
      services: {
        filePickerService: {
          pickFile: vi.fn().mockResolvedValue({ bytes: realBytes }),
        },
        tolgee: { t: (s: string) => s },
      },
    });

    addImportBackupEffects(testBed.addEffect);
    await testBed.dispatchHandled(importData());
    const importDataSqlAction = testBed.getDispatchedAction(importDataSql);

    await testBed.dispatchHandled(importDataSqlAction);

    const dispatchedImport = testBed.getDispatchedAction(importBackupData);
    expect(dispatchedImport.payload.workouts).toHaveLength(420);
    expect(dispatchedImport.payload.feed).toBeDefined();
    expect(Object.values(dispatchedImport.payload.programs)).toHaveLength(13);
  });

  it('dispatches a valid import when it is a proto', async () => {
    const realBytes = await readFile(resolve(__dirname, '../../utils/__test__/export.liftlogbackup.protobuf.gz'));
    const testBed = createAddEffectTestBed({
      services: {
        filePickerService: {
          pickFile: vi.fn().mockResolvedValue({ bytes: realBytes }),
        },
        tolgee: { t: (s: string) => s },
      },
    });

    addImportBackupEffects(testBed.addEffect);
    await testBed.dispatchHandled(importData());
    const importDataSqlAction = testBed.getDispatchedAction(importDataProto);

    await testBed.dispatchHandled(importDataSqlAction);

    const dispatchedImport = testBed.getDispatchedAction(importBackupData);
    expect(dispatchedImport.payload.workouts).toHaveLength(85);
    expect(dispatchedImport.payload.feed).toBeUndefined();
    expect(Object.values(dispatchedImport.payload.programs)).toHaveLength(0);
  });
  it('dispatches the appropriate actions when importing', async () => {
    const testBed = createAddEffectTestBed({
      services: {
        tolgee: { t: (s: string) => s },
      },
    });
    addImportBackupEffects(testBed.addEffect);

    const mockWorkouts = [EmptySession, EmptySession.with({ id: uuid() })] as Session[];
    const mockPrograms = {} as Record<string, ProgramBlueprint>;
    const mockFeed: FeedBackupData = {
      identity: {} as FeedIdentity,
      feedItems: [],
      followRequests: [],
      followed: [],
      followers: [],
    };

    await testBed.dispatchHandled(
      importBackupData({
        workouts: mockWorkouts,
        programs: mockPrograms,
        feed: mockFeed,
      }),
    );

    expect(testBed.getDispatchedAction(upsertStoredSessions).payload).toBe(mockWorkouts);
    expect(testBed.getDispatchedAction(upsertSavedPlans).payload).toBe(mockPrograms);
    expect(testBed.getDispatchedAction(showSnackbar).payload.text).toBe('Restore complete!');
    expect(testBed.getDispatchedAction(checkIfWeightMigrationRequired)).toBeDefined();
    expect(testBed.getDispatchedAction(beginFeedImport).payload).toBe(mockFeed);
  });

  it('does not dispatch beginFeedImport when feed is absent', async () => {
    const testBed = createAddEffectTestBed({
      services: {
        tolgee: { t: (s: string) => s },
      },
    });
    addImportBackupEffects(testBed.addEffect);

    await testBed.dispatchHandled(
      importBackupData({
        workouts: [],
        programs: {},
        feed: undefined,
      }),
    );

    testBed.expectNotDispatched(beginFeedImport);
  });
});
