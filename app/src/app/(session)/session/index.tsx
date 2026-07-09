import ConfirmationDialog from '@/components/presentation/foundation/confirmation-dialog';
import SessionComponent from '@/components/smart/session-component';
import SessionMoreMenuComponent from '@/components/smart/session-more-menu-component';
import { useAppSelector, useAppSelectorWithArg } from '@/store';
import { selectCurrentSession } from '@/store/current-session';
import { useFinishWorkout } from '@/hooks/useFinishWorkout';
import { useTranslate } from '@tolgee/react';
import { Stack, useRouter } from 'expo-router';
import { useKeepAwake } from 'expo-keep-awake';
import { useState } from 'react';

export default function Index() {
  const finishWorkout = useFinishWorkout('workoutSession');
  const session = useAppSelectorWithArg(selectCurrentSession, 'workoutSession');
  const showPostWorkoutSummary = useAppSelector((x) => x.settings.showPostWorkoutSummary);
  const keepAwake = useAppSelector((x) => x.settings.keepScreenAwakeDuringWorkout);
  const { dismissTo, push } = useRouter();
  const { t } = useTranslate();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const save = (force = false) => {
    const finishedSessionId = session?.id;
    if (session) {
      if (!force && !session.isComplete) {
        setConfirmOpen(true);
        return;
      }
      setConfirmOpen(false);
    }
    if (showPostWorkoutSummary) {
      if (finishedSessionId) {
        push(`/session/post-workout?sessionId=${encodeURIComponent(finishedSessionId)}&source=finished`);
        return;
      }
    } else {
      const hasDiff = finishWorkout();
      if (hasDiff) {
        dismissTo('/diff-save', { withAnchor: true });
      } else {
        dismissTo('/');
      }
    }
  };
  const showBodyweight = useAppSelector((x) => x.settings.showBodyweight);

  return (
    <>
      {keepAwake && <KeepAwake />}
      <Stack.Screen
        options={{
          title: session?.blueprint.name ?? 'Workout',
        }}
      />
      <SessionMoreMenuComponent target="workoutSession" save={save} />
      <SessionComponent
        target="workoutSession"
        showBodyweight={showBodyweight}
        openPostWorkoutSummary={() => {
          if (!session?.id) {
            return;
          }
          push(`/session/post-workout?sessionId=${encodeURIComponent(session.id)}&source=live`);
        }}
      />
      <ConfirmationDialog
        okText={t('generic.finish.button')}
        onOk={() => save(true)}
        onCancel={() => setConfirmOpen(false)}
        textContent={t('workout.finish.incomplete.body')}
        headline={t('workout.finish.confirm.title')}
        open={confirmOpen}
      />
    </>
  );
}

/**
 * Allows us to conditionally keep the screen awake, as we cannot use hooks conditionally
 */
function KeepAwake() {
  useKeepAwake();
  return <></>;
}
