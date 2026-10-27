import { describe, it, expect, vi, MockedObject, beforeAll } from 'vitest';
import { exportData } from '@/store/settings';
import { addExportBackupEffects } from '@/store/settings/export-backup-effects';
import { createAddEffectTestBed } from '@/utils/__test__/add-effect-testbed';
import { FileExportService } from '@/services/file-export-service';
import { showSnackbar } from '@/store/app';
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
    const bytes = await readFile(resolve(__dirname, '../../utils/__test__/export.liftlogbackup.sqlite.gz'));

    expoDb = await deserializeDatabaseAsync(gunzipSync(bytes));
  });

  function makeTestBed() {
    const fileExportService = makeFileExportService();
    const testBed = createAddEffectTestBed({
      services: { fileExportService, expoDb, tolgee: { t: (s: string) => s } },
    });
    addExportBackupEffects(testBed.addEffect);
    return { fileExportService, testBed };
  }

  it('calls exportBytes with a .sqlite.gz filename and application/octet-stream content type', async () => {
    const { fileExportService, testBed } = makeTestBed();

    await testBed.dispatchHandled(exportData({ includeFeed: true }));

    expect(fileExportService.exportBytes).toHaveBeenCalledOnce();
    const [fileName, , contentType] = fileExportService.exportBytes.mock.calls[0]!;
    expect(fileName).toMatch(/^export\.liftlogbackup\.\d{8}_\d{6}\.sqlite\.gz$/);
    expect(contentType).toBe('application/octet-stream');
  });

  it('exports a non-empty gzip payload', async () => {
    const { fileExportService, testBed } = makeTestBed();

    await testBed.dispatchHandled(exportData({ includeFeed: true }));

    const [, bytes] = fileExportService.exportBytes.mock.calls[0]!;
    expect(bytes).toBeInstanceOf(Uint8Array);
    expect(bytes.length).toBeGreaterThan(0);
  });

  it('shows the generating snackbar', async () => {
    const { testBed } = makeTestBed();

    await testBed.dispatchHandled(exportData({ includeFeed: true }));

    expect(testBed.getDispatchedAction(showSnackbar).payload.text).toBe('backup.generating.message');
  });

  it('with includeFeed=false, executes feed table deletions on the backup db', async () => {
    const { fileExportService, testBed } = makeTestBed();

    await testBed.dispatchHandled(exportData({ includeFeed: false }));

    expect(fileExportService.exportBytes).toHaveBeenCalledOnce();
  });

  it('with includeFeed=true, skips the feed table deletions', async () => {
    const { fileExportService, testBed } = makeTestBed();

    await testBed.dispatchHandled(exportData({ includeFeed: true }));

    expect(fileExportService.exportBytes).toHaveBeenCalledOnce();
  });
});
