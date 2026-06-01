import { AddEffectFn } from '@/store/store';
import { exportData } from '@/store/settings';
import { streamToUint8Array } from '@/utils/stream';
import 'compression-streams-polyfill';
import { DateTimeFormatter, LocalDateTime } from '@js-joda/core';
import { backupDatabaseAsync, openDatabaseAsync } from 'expo-sqlite';

export function addExportBackupEffects(addEffect: AddEffectFn) {
  addEffect(
    exportData,
    async (
      { payload: { includeFeed } },
      { extra: { fileExportService, expoDb } },
    ) => {
      const backupDatabase = await openDatabaseAsync(':memory:');
      await backupDatabaseAsync({
        sourceDatabase: expoDb,
        destDatabase: backupDatabase,
      });
      if (!includeFeed) {
        await backupDatabase.execAsync(`
          DELETE FROM feed_items;
          DELETE FROM feed_identity;
          DELETE FROM feed_followed_user;
          DELETE FROM feed_follower_user;
          DELETE FROM feed_follow_request;
          DELETE FROM feed_revoked_follow_secrets;
          DELETE FROM feed_unpublished_sessions;
          `);
      }
      const bytes = await backupDatabase.serializeAsync();
      const stream = new CompressionStream('gzip');
      const writer = stream.writable.getWriter();
      // Don't await this until we start reading
      const writePromise = writer.write(bytes);
      const readable = stream.readable;
      const gzippedPromise = streamToUint8Array(readable);

      await writePromise;
      await writer.close();
      const now = LocalDateTime.now()
        .withNano(0)
        .format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
        .replaceAll(':', '')
        .replaceAll('T', '_')
        .replaceAll('-', '');

      await fileExportService.exportBytes(
        `export.liftlogbackup.${now}.sqlite.gz`,
        await gzippedPromise,
        'application/octet-stream',
      );
    },
  );
}
