import ConfirmationDialog from '@/components/presentation/foundation/confirmation-dialog';
import { Session } from '@/models/session-models';
import { useAppSelector } from '@/store';
import { selectActiveSession } from '@/store/stored-sessions';
import { useStartWorkout } from '@/hooks/useStartWorkout';
import { T, useTranslate } from '@tolgee/react';
import { useRouter } from 'expo-router';
import { useState } from 'react';

/**
 * Opens a session as the workout in progress, asking first when that would discard a different
 * unfinished one. Returns the dialog to render alongside whatever triggers `start`.
 */
export function useStartWorkoutWithConfirmation() {
  const { t } = useTranslate();
  const { push } = useRouter();
  const activeSession = useAppSelector(selectActiveSession);
  const startWorkout = useStartWorkout();
  const [pendingReplace, setPendingReplace] = useState<Session | undefined>();

  const open = (session: Session) => {
    if (activeSession?.id !== session.id) {
      startWorkout(session);
    }
    push('/(tabs)/(session)/session', { withAnchor: true });
  };

  const start = (session: Session) => {
    if (activeSession && activeSession.id !== session.id) {
      setPendingReplace(session);
      return;
    }
    open(session);
  };

  const confirmationDialog = (
    <ConfirmationDialog
      open={!!pendingReplace}
      onCancel={() => setPendingReplace(undefined)}
      okText={t('generic.replace.button')}
      onOk={() => {
        if (pendingReplace) {
          open(pendingReplace);
        }
        setPendingReplace(undefined);
      }}
      headline={<T keyName="workout.replace_current.confirm.title" />}
      textContent={<T keyName="workout.replace_in_progress.confirm.body" />}
    />
  );

  return { start, confirmationDialog };
}
