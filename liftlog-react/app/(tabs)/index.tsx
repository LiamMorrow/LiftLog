import SessionComponent from '@/components/smart/session-component';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useScroll } from '@/hooks/useScollListener';
import { defaultSession } from '@/models/test-data';
import { RootState } from '@/store';
import { setCurrentSession } from '@/store/current-session';
import { Tabs } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { Button } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';

export default function Index() {
  const { colors } = useAppTheme();
  const { setScrolled } = useScroll();
  const s = useSelector(
    (state: RootState) => state.currentSession.workoutSession,
  );
  const dispatch = useDispatch();

  if (!s) {
    return (
      <Button
        onPress={() =>
          dispatch(
            setCurrentSession({
              target: 'workoutSession',
              session: defaultSession,
            }),
          )
        }
      >
        Start a session
      </Button>
    );
  }

  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          height: '100%',
        },
      ]}
    >
      <Tabs.Screen options={{ title: 'Workout' }} />
      <ScrollView
        onScroll={(e) => setScrolled(e.nativeEvent.contentOffset.y > 0)}
        style={{
          height: '100%',
        }}
      >
        <SessionComponent target="workoutSession" />
      </ScrollView>
    </View>
  );
}
