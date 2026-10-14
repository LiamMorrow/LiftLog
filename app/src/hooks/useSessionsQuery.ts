import { useServices } from '@/components/smart/services-provider';
import { useAppSelector } from '@/store';
import { selectSessionsRevision } from '@/store/stored-sessions';
import { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import { useIsFocused } from 'expo-router';
import { useEffect, useState } from 'react';

/**
 * Reads sessions from the database. `read` runs again when `key` changes or a finished session is written,
 * so `key` must identify everything `read` depends on.
 *
 * As this is fairly expensive, we only refresh the data after initial load when the screen is focused
 */
export function useSessionsQuery<T>(read: (db: ExpoSQLiteDatabase) => T, key: string): T | undefined {
  const { db } = useServices();
  const revision = useAppSelector(selectSessionsRevision);
  const isFocused = useIsFocused();
  const [result, setResult] = useState(() => (isFocused ? { value: read(db), revision, key } : undefined));
  const isStale = !result || result.key !== key || result.revision !== revision;

  useEffect(() => {
    if (isFocused || !isStale) {
      return;
    }
    const handle = requestIdleCallback(() => setResult({ value: read(db), revision, key }));
    return () => cancelIdleCallback(handle);
  }, [isFocused, isStale, read, db, revision, key]);

  if (isFocused && isStale) {
    const next = { value: read(db), revision, key };
    setResult(next);
    return next.value;
  }
  return result?.value;
}
