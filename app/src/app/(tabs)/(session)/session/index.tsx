import SessionComponent from '@/components/smart/session-component';
import SessionMoreMenuComponent from '@/components/smart/session-more-menu-component';
import { getPostWorkoutHref } from '@/components/smart/post-workout';
import { useAppSelector } from '@/store';
import { selectSharingLive } from '@/store/feed';
import { useDispatch } from 'react-redux';
import { selectActiveSession, updateStoredSession } from '@/store/stored-sessions';
import { useFinishWorkout } from '@/hooks/useFinishWorkout';
import { useTranslate } from '@tolgee/react';
import { Stack, useRouter } from 'expo-router';
import { useKeepAwake } from 'expo-keep-awake';
import { useFeedHubLease } from '@/hooks/useFeedHubLease';
import { useConfirm } from '@/hooks/useConfirm';

export default function Index() {
  const session = useAppSelector(selectActiveSession);
  const dispatch = useDispatch();
  const finishWorkout = useFinishWorkout(session?.id);
  const showPostWorkoutSummary = useAppSelector((x) => x.settings.showPostWorkoutSummary);
  const keepAwake = useAppSelector((x) => x.settings.keepScreenAwakeDuringWorkout);
  const sharingLive = useAppSelector(selectSharingLive);
  useFeedHubLease('trainer', sharingLive);
  const { dismissTo, push } = useRouter();
  const { t } = useTranslate();
  const confirm = useConfirm();

  const save = (force = false) => {
    if (!session) {
      return;
    }
    if (!force && !session.isComplete) {
      confirm({
        title: t('workout.finish.confirm.title'),
        message: t('workout.finish.incomplete.body'),
        okText: t('generic.finish.button'),
        onOk: () => save(true),
      });
      return;
    }
    const hasDiff = finishWorkout();
    dismissTo('/');
    if (showPostWorkoutSummary) {
      push(getPostWorkoutHref(session.id));
    }
    if (hasDiff) {
      push('/diff-save');
    }
  };
  const showBodyweight = useAppSelector((x) => x.settings.showBodyweight);

  // Finishing clears the active session while this screen is still mounted for the dismiss animation.
  if (!session) {
    return null;
  }

  return (
    <>
      {keepAwake && <KeepAwake />}
      <Stack.Screen
        options={{
          title: session.blueprint.name,
          headerTitleAlign: 'left',
        }}
      />
      <SessionMoreMenuComponent session={session} isActiveWorkout save={save} />
      <SessionComponent
        session={session}
        updateSession={(update) => dispatch(updateStoredSession({ sessionId: session.id, update }))}
        isActiveWorkout
        showBodyweight={showBodyweight}
        openPostWorkoutSummary={() => push(getPostWorkoutHref(session.id))}
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
