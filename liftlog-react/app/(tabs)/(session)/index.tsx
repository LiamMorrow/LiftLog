import { useAppTheme } from '@/hooks/useAppTheme';
import { useScroll } from '@/hooks/useScollListener';
import { defaultSession } from '@/models/test-data';
import { setCurrentSession } from '@/store/current-session';
import { useTranslate } from '@tolgee/react';
import { Link, Tabs, useNavigation } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { Button } from 'react-native-paper';
import { useDispatch } from 'react-redux';

export default function Index() {
  const { colors } = useAppTheme();
  const { setScrolled } = useScroll();
  const dispatch = useDispatch();
  const { navigate } = useNavigation();
  const { t } = useTranslate();

  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          height: '100%',
        },
      ]}
    >
      <Tabs.Screen options={{ title: t('UpcomingWorkouts') }} />
      <ScrollView
        onScroll={(e) => setScrolled(e.nativeEvent.contentOffset.y > 0)}
        style={{
          height: '100%',
        }}
      ></ScrollView>
      <Button
        onPress={() => {
          dispatch(
            setCurrentSession({
              target: 'workoutSession',
              session: defaultSession,
            }),
          );
        }}
      >
        <Link href={'/session'}>Start a session</Link>
      </Button>
    </View>
  );
}
