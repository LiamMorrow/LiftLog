import { readSession } from '@/db/sessions';
import { useSessionsQuery } from '@/hooks/useSessionsQuery';
import { Session } from '@/models/session-models';
import { useAppSelectorWithArg } from '@/store';
import { selectSession } from '@/store/stored-sessions';

/** A session that is open for editing comes from the store, where its edits land first; any other is read from the database. */
export function useSession(sessionId: string | undefined): Session | undefined {
  const openSession = useAppSelectorWithArg(selectSession, sessionId ?? '');
  const storedSession = useSessionsQuery(
    (db) => (openSession || !sessionId ? undefined : readSession(db, sessionId)),
    `${sessionId}:${!!openSession}`,
  );
  return openSession ?? storedSession;
}
