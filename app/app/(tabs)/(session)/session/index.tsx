import ConfirmationDialog from '@/components/presentation/confirmation-dialog';
import LimitedHtml from '@/components/presentation/limited-html';
import SessionComponent from '@/components/smart/session-component';
import SessionMoreMenuComponent from '@/components/smart/session-more-menu-component';
import { useAppSelector, useAppSelectorWithArg } from '@/store';
import {
  persistCurrentSession,
  selectCurrentSession,
} from '@/store/current-session';
import { addUnpublishedSessionId } from '@/store/feed';
import { setStatsIsDirty } from '@/store/stats';
import { useTranslate } from '@tolgee/react';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { useDispatch } from 'react-redux';

export default function Index() {
  const dispatch = useDispatch();
  const session = useAppSelectorWithArg(selectCurrentSession, 'workoutSession');
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
      dispatch(addUnpublishedSessionId(session.id));
    }
    dispatch(persistCurrentSession('workoutSession'));
    dispatch(setStatsIsDirty(true));
    dismissTo('/');
  };
  const showBodyweight = useAppSelector((x) => x.settings.showBodyweight);

  return (
    <>
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
        okText={t('Finish')}
        onOk={() => save(true)}
        onCancel={() => setConfirmOpen(false)}
        textContent={<LimitedHtml value={t('FinishIncompleteWorkout')} />}
        headline={t('Finish workout?')}
        open={confirmOpen}
      />
    </>
  );
}
