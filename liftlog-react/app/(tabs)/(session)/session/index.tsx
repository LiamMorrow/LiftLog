import SessionComponent from '@/components/smart/session-component';
import { useAppTheme } from '@/hooks/useAppTheme';
import { RootState, useAppSelector } from '@/store';
import { persistCurrentSession } from '@/store/current-session';
import { Stack, useRouter } from 'expo-router';
import { View } from 'react-native';
import { Appbar } from 'react-native-paper';
import { useDispatch } from 'react-redux';

export default function Index() {
  const { colors } = useAppTheme();
  const dispatch = useDispatch();
  const session = useAppSelector(
    (state: RootState) => state.currentSession.workoutSession,
  );
  const { dismissTo } = useRouter();

  const save = () => {
    dispatch(persistCurrentSession('workoutSession'));
    // TODO
    if (session) {
      // dispatch(addUnpublishedSessionIdAction(session.id));
    }
    // dispatch(setStatsIsDirty(true));
    dismissTo('/');
  };

  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          flex: 1,
        },
      ]}
    >
      <Stack.Screen
        options={{
          title: session?.blueprint.name ?? 'Workout',
          headerRight: () => (
            <Appbar.Action icon={'save'} onPress={save}></Appbar.Action>
          ),
        }}
      />

      <SessionComponent target="workoutSession" showBodyweight={true} />
    </View>
  );
}
