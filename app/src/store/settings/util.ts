import { streamToUint8Array, writeInChunks } from '@/utils/stream';
import { backupDatabaseAsync, openDatabaseAsync, SQLiteDatabase } from 'expo-sqlite';

async function presentTablesLike(db: SQLiteDatabase, pattern: string): Promise<string[]> {
  const rows = await db.getAllAsync<{ name: string }>(
    `SELECT name FROM sqlite_master WHERE type = 'table' AND name LIKE ? ESCAPE '\\'`,
    [pattern],
  );
  return rows.map(({ name }) => name);
}

async function clearTables(db: SQLiteDatabase, tables: string[]) {
  if (!tables.length) {
    return;
  }
  await db.execAsync(tables.map((name) => `DELETE FROM "${name}";`).join('\n'));
}

export async function getBackupBytes(options: { includeFeed: boolean; expoDb: SQLiteDatabase }) {
  const { expoDb, includeFeed } = options;

  const backupDatabase = await openDatabaseAsync(':memory:', { useNewConnection: true });
  try {
    await backupDatabaseAsync({
      sourceDatabase: expoDb,
      destDatabase: backupDatabase,
    });
    // Backend configuration never travels in a backup: the blob is plaintext gzip sitting on the
    // very server whose credentials it would carry.
    await clearTables(backupDatabase, await presentTablesLike(backupDatabase, 'backend%'));
    if (!includeFeed) {
      await clearTables(backupDatabase, await presentTablesLike(backupDatabase, 'feed\\_%'));
    }
    await backupDatabase.execAsync('VACUUM');

    const bytes = await backupDatabase.serializeAsync();
    const stream = new CompressionStream('gzip');
    const writer = stream.writable.getWriter();
    // Start draining before writing, or the chunked writes stall on backpressure.
    const gzippedPromise = streamToUint8Array(stream.readable);

    await writeInChunks(writer, bytes);
    await writer.close();
    return await gzippedPromise;
  } finally {
    await backupDatabase.closeAsync();
  }
}
