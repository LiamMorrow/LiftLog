import SessionComponent from '@/components/smart/session-component';
import { RootState, useAppSelector } from '@/store';
import { persistCurrentSession } from '@/store/current-session';
import { addUnpublishedSessionId } from '@/store/feed';
import { setStatsIsDirty } from '@/store/stats';
import { Stack, useRouter } from 'expo-router';
import { Appbar } from 'react-native-paper';
import { useDispatch } from 'react-redux';

export default function Index() {
  const dispatch = useDispatch();
  const session = useAppSelector(
    (state: RootState) => state.currentSession.workoutSession,
  );
  const { dismissTo } = useRouter();

  const save = () => {
    dispatch(persistCurrentSession('workoutSession'));
    if (session) {
      dispatch(addUnpublishedSessionId(session.id));
    }
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
            <Appbar.Action icon={'inventory'} onPress={save}></Appbar.Action>
          ),
        }}
      />
      <SessionComponent
        target="workoutSession"
        showBodyweight={showBodyweight}
      />
    </>
  );
}
