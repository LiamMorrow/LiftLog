import { Client, createClient } from '@libsql/client';
import { writeFileSync, unlinkSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import type {
  openDatabaseAsync as expoOpenDatabaseAsync,
  openDatabaseSync as expoOpenDatabaseSync,
  backupDatabaseAsync as expoBackupDatabaseAsync,
} from 'expo-sqlite';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';

export const openDatabaseSync: typeof expoOpenDatabaseSync = () => {
  const tmpPath = join(tmpdir(), `liftlog-test-${randomUUID()}.db`);
  const client = withSerialize(createClient({ url: `file:${tmpPath}` }));
  (client as unknown as { closeAsync: () => Promise<void> }).closeAsync = async () => {
    client.close();
    try { unlinkSync(tmpPath); } catch {}
  };
  return client as unknown as ReturnType<typeof expoOpenDatabaseSync>;
};
export const openDatabaseAsync: typeof expoOpenDatabaseAsync = async () => {
  const tmpPath = join(tmpdir(), `liftlog-test-${randomUUID()}.db`);
  const client = withSerialize(createClient({ url: `file:${tmpPath}` }));
  (client as unknown as { closeAsync: () => Promise<void> }).closeAsync = async () => {
    client.close();
    try { unlinkSync(tmpPath); } catch {}
  };
  return client as unknown as ReturnType<typeof expoOpenDatabaseAsync>;
};
export const backupDatabaseAsync: typeof expoBackupDatabaseAsync = async (
  opts,
) => {
  const src = opts.sourceDatabase as unknown as Client;
  const dst = opts.destDatabase as unknown as Client;

  // Get all user tables from source
  const tablesResult = await src.execute(
    `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name`,
  );
  const tables = tablesResult.rows.map((r) => r[0] as string);

  // Collect all DDL (tables, indexes, triggers, views) in creation order
  const schemaResult = await src.execute(
    `SELECT sql FROM sqlite_master WHERE sql IS NOT NULL AND name NOT LIKE 'sqlite_%' ORDER BY rootpage`,
  );

  const stmts: string[] = [];

  // Recreate schema on dest
  for (const row of schemaResult.rows) {
    stmts.push(row[0] as string);
  }

  // Copy rows for each table
  for (const table of tables) {
    const rows = await src.execute(`SELECT * FROM "${table}"`);
    if (rows.rows.length === 0) continue;

    const cols = rows.columns.map((c) => `"${c}"`).join(', ');
    for (const row of rows.rows) {
      const values = rows.columns
        .map((_, i) => {
          const v = row[i];
          if (v === null) return 'NULL';
          if (typeof v === 'number' || typeof v === 'bigint') return String(v);
          if (v instanceof Uint8Array)
            return `X'${Buffer.from(v).toString('hex')}'`;
          // eslint-disable-next-line @typescript-eslint/no-base-to-string
          return `'${String(v).replace(/'/g, "''")}'`;
        })
        .join(', ');
      stmts.push(`INSERT INTO "${table}" (${cols}) VALUES (${values})`);
    }
  }

  await dst.batch(stmts, 'write');
};

export async function deserializeDatabaseAsync(data: Uint8Array) {
  const tmpPath = join(tmpdir(), `liftlog-test-${randomUUID()}.db`);
  writeFileSync(tmpPath, data);

  const client = withSerialize(createClient({ url: `file:${tmpPath}` }));

  // Attach cleanup so callers using closeAsync (expo-sqlite compat) tidy up the temp file
  (client as unknown as { closeAsync: () => Promise<void> }).closeAsync =
    async () => {
      client.close();
      try {
        unlinkSync(tmpPath);
      } catch {}
    };

  return client;
}
function withSerialize(
  client: Client,
): Client & { serializeAsync: () => Promise<Uint8Array> } {
  return Object.assign(client, {
    serializeAsync: async (): Promise<Uint8Array> => {
      const tmpPath = join(tmpdir(), `liftlog-serialize-${randomUUID()}.db`);
      try {
        await client.execute(`VACUUM INTO '${tmpPath}'`);
        return new Uint8Array(readFileSync(tmpPath));
      } finally {
        try {
          unlinkSync(tmpPath);
        } catch {}
      }
    },
    execAsync: async (sql: string): Promise<void> => {
      await client.execute(sql);
    },
  });
}
