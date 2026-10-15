import { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import { explodeSessions } from '@/services/js-migrations/explode-sessions';
import { mergeFollowsIntoFriends } from '@/services/js-migrations/merge-follows-into-friends';

export interface JsMigration {
  id: string;
  after: string;
  run: (tx: ExpoSQLiteDatabase) => void;
}

export const jsMigrations: JsMigration[] = [explodeSessions, mergeFollowsIntoFriends];
