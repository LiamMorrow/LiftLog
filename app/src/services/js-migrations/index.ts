import { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import { explodeSessions } from '@/services/js-migrations/explode-sessions';

export interface JsMigration {
  id: string;
  after: string;
  run: (tx: ExpoSQLiteDatabase) => void;
}

export const jsMigrations: JsMigration[] = [explodeSessions];
