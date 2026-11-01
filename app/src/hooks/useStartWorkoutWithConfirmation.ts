import { Session } from '@/models/session-models';
import { useAppSelector } from '@/store';
import { selectActiveSession } from '@/store/stored-sessions';
import { useStartWorkout } from '@/hooks/useStartWorkout';
import { useConfirm } from '@/hooks/useConfirm';
import { useTranslate } from '@tolgee/react';
import { useRouter } from 'expo-router';

/**
 * Opens a session as the workout in progress, asking first when that would discard a different
 * unfinished one.
 *
 * `onStarted` runs once the session is going ahead, before its screen is opened - after the prompt is
 * confirmed, not when it is raised.
 */
export function useStartWorkoutWithConfirmation({ onStarted }: { onStarted?: (session: Session) => void } = {}) {
  const { t } = useTranslate();
  const { push } = useRouter();
  const activeSession = useAppSelector(selectActiveSession);
  const startWorkout = useStartWorkout();
  const confirm = useConfirm();

  const open = (session: Session) => {
    if (activeSession?.id !== session.id) {
      startWorkout(session);
    }
    onStarted?.(session);
    push('/(tabs)/(session)/session', { withAnchor: true });
  };

  const start = (session: Session) => {
    if (activeSession && activeSession.id !== session.id) {
      confirm({
        title: t('workout.replace_current.confirm.title'),
        message: t('workout.replace_in_progress.confirm.body'),
        okText: t('generic.replace.button'),
        destructive: true,
        onOk: () => open(session),
      });
      return;
    }
    open(session);
  };

  return { start };
}
