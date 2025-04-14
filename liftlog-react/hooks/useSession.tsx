import { Session } from '@/models/session-models';
import { useSelector } from '@/store';
import { SessionTarget } from '@/store/current-session';
import { useMemo } from 'react';

export function useSession(sessionTarget: SessionTarget): Session | undefined {
  const sessionPOJO = useSelector((s) => s.currentSession[sessionTarget]);
  return useMemo(() => Session.fromPOJO(sessionPOJO), [sessionPOJO]);
}
