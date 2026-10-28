import FullHeightScrollView from '@/components/layout/full-height-scroll-view';
import { PageActions } from '@/components/presentation/foundation/page-actions';
import CheckIcon from '@expo/material-symbols/check.xml';
import { SessionComparisonTable } from '@/components/presentation/workout/session-comparison-table';
import { spacing } from '@/hooks/useAppTheme';
import { useFinishWorkout } from '@/hooks/useFinishWorkout';
import { getSessionReferenceTime } from '@/store/stored-sessions';
import { useSession } from '@/hooks/useSession';
import { useSessionsQuery } from '@/hooks/useSessionsQuery';
import { readPreviousComparableSession } from '@/db/sessions';
import { useTranslate } from '@tolgee/react';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';

export default function PostWorkoutPage() {
  const { sessionId, source } = useLocalSearchParams<{
    sessionId?: string;
    source?: 'finished' | 'live' | 'history';
  }>();
  const session = useSession(sessionId);
  const openedAfterFinishingWorkout = source === 'finished';
  const showFinishButton = openedAfterFinishingWorkout;
  const showBackButton = !openedAfterFinishingWorkout;
  const before = session && getSessionReferenceTime(session);
  const previousComparableSession = useSessionsQuery(
    (db) =>
      session && before
        ? readPreviousComparableSession(db, { id: session.id, name: session.blueprint.name, before })
        : undefined,
    `${session?.id}:${session?.blueprint.name}:${before?.toString()}`,
  );
  const { dismissTo, push } = useRouter();
  const finishWorkout = useFinishWorkout(sessionId);
  const { t } = useTranslate();

  useEffect(() => {
    if (!sessionId || !session) {
      dismissTo('/session');
    }
  }, [dismissTo, session, sessionId]);

  if (!sessionId || !session) {
    return null;
  }

  const floatingBottomContainer = showFinishButton ? (
    <PageActions
      primaryKind="commit"
      primary={{
        label: t('generic.finish.button'),
        icon: CheckIcon,
        systemImage: 'checkmark',
        onPress: () => {
          const hasDiff = finishWorkout();
          dismissTo('/');
          if (hasDiff) {
            push('/diff-save');
          }
        },
      }}
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
        <SessionComparisonTable mode="full" previousSession={previousComparableSession} session={session} />
      </View>
    </FullHeightScrollView>
  );
}
