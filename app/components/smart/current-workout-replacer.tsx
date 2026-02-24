import ConfirmationDialog from '@/components/presentation/foundation/confirmation-dialog';
import { Session } from '@/models/session-models';
import { useAppSelector, useAppSelectorWithArg } from '@/store';
import {
  selectCurrentSession,
  setCurrentSession,
} from '@/store/current-session';
import { T, useTranslate } from '@tolgee/react';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useDebouncedCallback } from 'use-debounce';

export function CurrentWorkoutReplacer({
  session,
  clearSession,
}: {
  session: Session | undefined;
  clearSession: () => void;
}) {
  const { t } = useTranslate();
  const hasActiveSession = useAppSelector(
    (x) => !!x.currentSession.workoutSession,
  );
  const { push } = useRouter();
  const currentSession = useAppSelectorWithArg(
    selectCurrentSession,
    'workoutSession',
  );
  const hasCurrentSession = !!currentSession;
  const dispatch = useDispatch();
  const replaceSession = useDebouncedCallback(
    (session: Session) => {
      clearSession();
      dispatch(
        setCurrentSession({
          target: 'workoutSession',
          session,
        }),
      );
      push('/(tabs)/(session)/session', { withAnchor: true });
    },
    500,
    { leading: true, trailing: false },
  );
  const replaceSessionDialogAction = () => {
    if (!session) return;
    replaceSession(session);
  };
  useEffect(() => {
    if (session && !hasCurrentSession) {
      replaceSession(session);
    }
  }, [session, hasCurrentSession, replaceSession]);
  return (
    <ConfirmationDialog
      open={hasActiveSession && !!session}
      onCancel={clearSession}
      okText={t('generic.replace.button')}
      onOk={replaceSessionDialogAction}
      headline={<T keyName="workout.replace_current.confirm.title" />}
      textContent={<T keyName="workout.replace_in_progress.confirm.body" />}
    />
  );
}
