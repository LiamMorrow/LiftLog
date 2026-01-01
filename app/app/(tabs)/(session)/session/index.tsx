import ConfirmationDialog from '@/components/presentation/confirmation-dialog';
import LimitedHtml from '@/components/presentation/limited-html';
import SessionComponent from '@/components/smart/session-component';
import SessionMoreMenuComponent from '@/components/smart/session-more-menu-component';
import { useAppSelector, useAppSelectorWithArg } from '@/store';
import {
  finishCurrentWorkout,
  selectCurrentSession,
} from '@/store/current-session';
import { useTranslate } from '@tolgee/react';
import { Stack, useRouter } from 'expo-router';
import { useKeepAwake } from 'expo-keep-awake';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

export default function Index() {
  const dispatch = useDispatch();
  const session = useAppSelectorWithArg(selectCurrentSession, 'workoutSession');
  const keepAwake = useAppSelector(
    (x) => x.settings.keepScreenAwakeDuringWorkout,
  );
  const { dismissTo } = useRouter();
  const { t } = useTranslate();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const save = (force = false) => {
    if (session) {
      if (!force && !session.isComplete) {
        setConfirmOpen(true);
        return;
      }
      setConfirmOpen(false);
    }
    dispatch(finishCurrentWorkout('workoutSession'));
    dismissTo('/');
  };
  useEffect(() => {
    if (!session) {
      dismissTo('/');
    }
  }, [session, dismissTo]);
  const showBodyweight = useAppSelector((x) => x.settings.showBodyweight);

  return (
    <>
      {keepAwake && <KeepAwake />}
      <Stack.Screen
        options={{
          title: session?.blueprint.name ?? 'Workout',
          headerRight: () => (
            <SessionMoreMenuComponent target="workoutSession" />
          ),
        }}
      />
      <SessionComponent
        target="workoutSession"
        showBodyweight={showBodyweight}
        saveAndClose={() => save()}
      />
      <ConfirmationDialog
        okText={t('generic.finish.button')}
        onOk={() => save(true)}
        onCancel={() => setConfirmOpen(false)}
        textContent={
          <LimitedHtml value={t('workout.finish.incomplete.body')} />
        }
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
