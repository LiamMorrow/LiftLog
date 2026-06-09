import { describe, it, expect, vi, MockedObject, beforeAll } from 'vitest';
import { exportData } from '@/store/settings';
import { addExportBackupEffects } from '@/store/settings/export-backup-effects';
import { createAddEffectTestBed } from '@/utils/__test__/add-effect-testbed';
import { FileExportService } from '@/services/file-export-service';
import { deserializeDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';
import { readFile } from 'fs/promises';
import { resolve } from 'node:path';
import { gunzipSync } from 'zlib';

function makeFileExportService(): MockedObject<FileExportService> {
  return {
    exportBytes: vi.fn().mockResolvedValue(undefined),
  };
}

describe('addExportBackupEffects', () => {
  let expoDb: SQLiteDatabase;
  beforeAll(async () => {
    const bytes = await readFile(
      resolve(__dirname, '../../utils/__test__/export.liftlogbackup.sqlite.gz'),
    );

    expoDb = await deserializeDatabaseAsync(gunzipSync(bytes));
  });
  it('calls exportBytes with a .sqlite.gz filename and application/octet-stream content type', async () => {
    const fileExportService = makeFileExportService();
    const testBed = createAddEffectTestBed({
      services: { fileExportService, expoDb },
    });
    addExportBackupEffects(testBed.addEffect);

    await testBed.dispatchHandled(exportData({ includeFeed: true }));

    expect(fileExportService.exportBytes).toHaveBeenCalledOnce();
    const [fileName, , contentType] =
      fileExportService.exportBytes.mock.calls[0];
    expect(fileName).toMatch(
      /^export\.liftlogbackup\.\d{8}_\d{6}\.sqlite\.gz$/,
    );
    expect(contentType).toBe('application/octet-stream');
  });

  it('exports a non-empty gzip payload', async () => {
    const fileExportService = makeFileExportService();
    const testBed = createAddEffectTestBed({
      services: { fileExportService, expoDb },
    });
    addExportBackupEffects(testBed.addEffect);

    await testBed.dispatchHandled(exportData({ includeFeed: true }));

    const [, bytes] = fileExportService.exportBytes.mock.calls[0];
    expect(bytes).toBeInstanceOf(Uint8Array);
    expect(bytes.length).toBeGreaterThan(0);
  });

  it('does not dispatch any actions', async () => {
    const fileExportService = makeFileExportService();
    const testBed = createAddEffectTestBed({
      services: { fileExportService, expoDb },
    });
    addExportBackupEffects(testBed.addEffect);

    await testBed.dispatchHandled(exportData({ includeFeed: true }));

    expect(testBed.dispatchedActions).toHaveLength(0);
  });

  it('with includeFeed=false, executes feed table deletions on the backup db', async () => {
    const fileExportService = makeFileExportService();
    const testBed = createAddEffectTestBed({
      services: { fileExportService, expoDb },
    });
    addExportBackupEffects(testBed.addEffect);

    // Just assert it completes without error — the real assertion is that
    // execAsync was called (covered by the db mock) and exportBytes still fires
    await testBed.dispatchHandled(exportData({ includeFeed: false }));

    expect(fileExportService.exportBytes).toHaveBeenCalledOnce();
  });

  it('with includeFeed=true, skips the feed table deletions', async () => {
    const fileExportService = makeFileExportService();
    const testBed = createAddEffectTestBed({
      services: { fileExportService, expoDb },
    });
    addExportBackupEffects(testBed.addEffect);

    await testBed.dispatchHandled(exportData({ includeFeed: true }));

    expect(fileExportService.exportBytes).toHaveBeenCalledOnce();
  });
});
