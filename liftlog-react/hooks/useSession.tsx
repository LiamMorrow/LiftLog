import { Session } from '@/models/session-models';
import { useAppSelector } from '@/store';
import { SessionTarget } from '@/store/current-session';
import { useMemo } from 'react';

export function useCurrentSession(
  sessionTarget: SessionTarget,
): Session | undefined {
  const sessionPOJO = useAppSelector((s) => s.currentSession[sessionTarget]);
  return useMemo(() => Session.fromPOJO(sessionPOJO), [sessionPOJO]);
}
