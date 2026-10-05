import type { DatabaseSync as DatabaseSyncType, StatementSync } from 'node:sqlite';
import { readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import type {
  openDatabaseAsync as expoOpenDatabaseAsync,
  openDatabaseSync as expoOpenDatabaseSync,
  backupDatabaseAsync as expoBackupDatabaseAsync,
  deserializeDatabaseAsync as expoDeserializeDatabaseAsync,
} from 'expo-sqlite';

const { DatabaseSync } = process.getBuiltinModule('node:sqlite');
type DatabaseSync = DatabaseSyncType;

type Param = string | number | bigint | null | Uint8Array;

const toParams = (params: unknown): Param[] =>
  (Array.isArray(params) ? params : params === undefined ? [] : [params]).map((value: unknown) =>
    value === undefined ? null : typeof value === 'boolean' ? Number(value) : (value as Param),
  );

function executeSync(statement: StatementSync, params: unknown) {
  const args = toParams(params);
  if (statement.columns().length) {
    const rows = statement.all(...args);
    return { changes: 0, lastInsertRowId: 0, getAllSync: () => rows, getFirstSync: () => rows[0] ?? null };
  }
  const { changes, lastInsertRowid } = statement.run(...args);
  return {
    changes: Number(changes),
    lastInsertRowId: Number(lastInsertRowid),
    getAllSync: () => [],
    getFirstSync: () => null,
  };
}

function prepareSync(raw: DatabaseSync, source: string) {
  const statement = raw.prepare(source);
  return {
    executeSync: (params?: unknown) => executeSync(statement, params),
    executeForRawResultSync: (params?: unknown) => {
      statement.setReturnArrays(true);
      try {
        const rows = statement.all(...toParams(params));
        return { getAllSync: () => rows, getFirstSync: () => rows[0] ?? null };
      } finally {
        statement.setReturnArrays(false);
      }
    },
    finalizeSync: () => {},
  };
}

const temporaryPath = () => join(tmpdir(), `liftlog-test-${randomUUID()}.db`);
const removeQuietly = (path: string) => {
  try {
    unlinkSync(path);
  } catch {}
};

class TestDatabase {
  constructor(
    public raw: DatabaseSync,
    private path?: string,
  ) {}

  prepareSync(source: string) {
    return prepareSync(this.raw, source);
  }

  execSync(source: string) {
    this.raw.exec(source);
  }

  async execAsync(source: string) {
    this.raw.exec(source);
  }

  async getAllAsync<T>(source: string, params?: unknown): Promise<T[]> {
    return this.raw.prepare(source).all(...toParams(params)) as T[];
  }

  async getFirstAsync<T>(source: string, params?: unknown): Promise<T | null> {
    return (this.raw.prepare(source).get(...toParams(params)) as T | undefined) ?? null;
  }

  async runAsync(source: string, params?: unknown) {
    const { changes, lastInsertRowid } = this.raw.prepare(source).run(...toParams(params));
    return { changes: Number(changes), lastInsertRowId: Number(lastInsertRowid) };
  }

  async serializeAsync(): Promise<Uint8Array> {
    const path = temporaryPath();
    try {
      this.raw.exec(`VACUUM INTO '${path}'`);
      return new Uint8Array(readFileSync(path));
    } finally {
      removeQuietly(path);
    }
  }

  replaceWith(raw: DatabaseSync, path: string) {
    this.closeSync();
    this.raw = raw;
    this.path = path;
  }

  closeSync() {
    this.raw.close();
    if (this.path) {
      removeQuietly(this.path);
    }
  }

  async closeAsync() {
    this.closeSync();
  }
}

const open = (path: string) => new DatabaseSync(path, { enableForeignKeyConstraints: false });

export const openDatabaseSync: typeof expoOpenDatabaseSync = () =>
  new TestDatabase(open(':memory:')) as unknown as ReturnType<typeof expoOpenDatabaseSync>;

export const openDatabaseAsync: typeof expoOpenDatabaseAsync = async () =>
  new TestDatabase(open(':memory:')) as unknown as Awaited<ReturnType<typeof expoOpenDatabaseAsync>>;

export const deserializeDatabaseAsync: typeof expoDeserializeDatabaseAsync = async (data) => {
  const path = temporaryPath();
  writeFileSync(path, data);
  return new TestDatabase(open(path), path) as unknown as Awaited<ReturnType<typeof expoDeserializeDatabaseAsync>>;
};

export const backupDatabaseAsync: typeof expoBackupDatabaseAsync = async ({ sourceDatabase, destDatabase }) => {
  const path = temporaryPath();
  (sourceDatabase as unknown as TestDatabase).raw.exec(`VACUUM INTO '${path}'`);
  (destDatabase as unknown as TestDatabase).replaceWith(open(path), path);
};

export const addDatabaseChangeListener = () => ({ remove: () => {} });
