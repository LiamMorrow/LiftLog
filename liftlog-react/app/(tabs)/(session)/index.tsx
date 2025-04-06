import FullHeightScrollView from '@/components/presentation/full-height-scroll-view';
import { defaultSession } from '@/models/test-data';
import { setCurrentSession } from '@/store/current-session';
import { useTranslate } from '@tolgee/react';
import { Stack, useRouter } from 'expo-router';
import { Button } from 'react-native-paper';
import { useDispatch } from 'react-redux';

export default function Index() {
  const dispatch = useDispatch();
  const { push } = useRouter();
  const { t } = useTranslate();

  return (
    <FullHeightScrollView>
      <Stack.Screen options={{ title: t('UpcomingWorkouts') }} />

      <Button
        onPress={() => {
          dispatch(
            setCurrentSession({
              target: 'workoutSession',
              session: defaultSession,
            }),
          );
          push('/session');
        }}
      >
        Start a session
      </Button>
    </FullHeightScrollView>
  );
}
