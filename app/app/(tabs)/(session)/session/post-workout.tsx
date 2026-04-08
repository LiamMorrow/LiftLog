import FullHeightScrollView from '@/components/layout/full-height-scroll-view';
import FloatingBottomContainer from '@/components/presentation/foundation/floating-bottom-container';
import { SessionComparisonTable } from '@/components/presentation/workout/session-comparison-table';
import { spacing } from '@/hooks/useAppTheme';
import { useAppSelector, useAppSelectorWithArg } from '@/store';
import {
  finishCurrentWorkout,
  selectCurrentSession,
} from '@/store/current-session';
import { selectPreferredWeightUnit } from '@/store/settings';
import {
  selectPreviousComparableSession,
  selectSessions,
  selectSession,
} from '@/store/stored-sessions';
import { getSessionPersonalBestEntries } from '@/utils/personal-bests';
import { useTranslate } from '@tolgee/react';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';
import { FAB } from 'react-native-paper';
import { useDispatch } from 'react-redux';

export default function PostWorkoutPage() {
  const { sessionId, source } = useLocalSearchParams<{
    sessionId?: string;
    source?: 'finished' | 'live' | 'history';
  }>();
  const storedSession = useAppSelectorWithArg(selectSession, sessionId ?? '');
  const currentWorkoutSession = useAppSelectorWithArg(
    selectCurrentSession,
    'workoutSession',
  );
  const session =
    storedSession ??
    (currentWorkoutSession?.id === sessionId
      ? currentWorkoutSession
      : undefined);
  const openedAfterFinishingWorkout = source === 'finished';
  const showFinishButton = openedAfterFinishingWorkout;
  const showBackButton = !openedAfterFinishingWorkout;
  const sessions = useAppSelector(selectSessions);
  const preferredUnit = useAppSelector(selectPreferredWeightUnit);
  const previousComparableSession = useAppSelectorWithArg(
    selectPreviousComparableSession,
    session,
  );
  const { dismissTo } = useRouter();
  const dispatch = useDispatch();
  const { t } = useTranslate();

  useEffect(() => {
    if (!sessionId || !session) {
      dismissTo('/session');
    }
  }, [dismissTo, session, sessionId]);

  if (!sessionId || !session) {
    return null;
  }

  const personalBestEntries = getSessionPersonalBestEntries(
    sessions,
    session,
    preferredUnit,
  );

  const floatingBottomContainer = showFinishButton ? (
    <FloatingBottomContainer
      fab={
        <FAB
          onPress={() => {
            dispatch(finishCurrentWorkout('workoutSession'));
            dismissTo('/');
          }}
          icon={'check'}
          label={t('generic.finish.button')}
        />
      }
    />
  ) : undefined;

  return (
    <FullHeightScrollView
      floatingChildren={floatingBottomContainer}
      scrollStyle={{ paddingHorizontal: spacing.pageHorizontalMargin }}
    >
      <Stack.Screen
        options={{
          presentation: 'modal',
          title: t('workout.post_workout.title'),
          gestureEnabled: showBackButton,
          headerBackVisible: showBackButton,
          headerLeft: showFinishButton ? () => null : undefined!,
        }}
      />
      <View style={{ marginVertical: spacing[4] }}>
        <SessionComparisonTable
          mode="full"
          personalBestEntries={personalBestEntries}
          previousSession={previousComparableSession}
          session={session}
        />
      </View>
    </FullHeightScrollView>
  );
}
