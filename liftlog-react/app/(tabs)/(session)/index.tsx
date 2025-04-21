import CardList from '@/components/presentation/card-list';
import ConfirmationDialog from '@/components/presentation/confirmation-dialog';
import FullHeightScrollView from '@/components/presentation/full-height-scroll-view';

import { Remote } from '@/components/presentation/remote';
import SessionSummary from '@/components/presentation/session-summary';
import SessionSummaryTitle from '@/components/presentation/session-summary-title';
import SplitCardControl from '@/components/presentation/split-card-control';
import { SurfaceText } from '@/components/presentation/surface-text';
import { AndroidNotificationAlert } from '@/components/smart/android-notification-alert';
import { Tips } from '@/components/smart/tips';
import { spacing } from '@/hooks/useAppTheme';
import { useSession } from '@/hooks/useSession';
import { Session } from '@/models/session-models';
import { RootState, useAppSelector } from '@/store';
import { setCurrentSession } from '@/store/current-session';
import { fetchUpcomingSessions } from '@/store/program';
import { T, useTranslate } from '@tolgee/react';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { Button, Card, Icon } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { useDebouncedCallback } from 'use-debounce';

function NoUpcomingSessions() {
  const { push } = useRouter();

  const activeProgramId = useAppSelector(
    (s: RootState) => s.program.activeProgramId,
  );
  return (
    <View style={{ gap: spacing[2], paddingHorizontal: spacing[2] }}>
      <Card>
        <Card.Content style={{ gap: spacing[4] }}>
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between' }}
          >
            <SurfaceText font="text-lg">
              <T keyName="NoPlanCreated" />
            </SurfaceText>
            <Icon size={20} source={'info'} />
          </View>
          <View style={{ flexDirection: 'row', gap: spacing[2] }}>
            <Button
              mode="contained-tonal"
              icon={'add'}
              style={{ flex: 1 }}
              onPress={() =>
                push(`/settings/manage-workouts/${activeProgramId}`)
              }
            >
              <T keyName="AddWorkouts" />
            </Button>
            <Button
              mode="contained"
              style={{ flex: 1 }}
              icon={'assignment'}
              onPress={() => push(`/settings/program-list`)}
            >
              <T keyName="SelectAPlan" />
            </Button>
          </View>
        </Card.Content>
      </Card>
    </View>
  );
}

function ListUpcomingWorkouts({ upcoming }: { upcoming: readonly Session[] }) {
  const dispatch = useDispatch();
  const currentSession = useSession('workoutSession');
  const { push } = useRouter();
  const [selectedSession, setSelectedSession] = useState<Session | undefined>();

  const selectSession = (session: Session) => {
    if (
      !currentSession ||
      currentSession.equals(session) ||
      !currentSession.isStarted
    ) {
      replaceSession(session);
    } else {
      setSelectedSession(session);
    }
  };
  const replaceSession = useDebouncedCallback(
    (session: Session) => {
      setSelectedSession(undefined);
      dispatch(
        setCurrentSession({
          target: 'workoutSession',
          session: session.toPOJO(),
        }),
      );
      push('/session');
    },
    500,
    { leading: true, trailing: false },
  );
  const replaceSessionDialogAction = () => {
    if (!selectedSession) return;
    replaceSession(selectedSession);
  };
  return (
    <>
      <View style={{ margin: spacing[2] }}>
        <Tips />
      </View>
      <CardList
        cardType="outlined"
        items={upcoming}
        onPress={selectSession}
        renderItem={(session) => {
          return (
            <SplitCardControl
              titleContent={
                <SessionSummaryTitle
                  isFilled={session.isStarted}
                  session={session}
                />
              }
              mainContent={
                <SessionSummary session={session} isFilled={false} />
              }
            />
          );
        }}
      />
      <ConfirmationDialog
        open={!!selectedSession}
        onCancel={() => setSelectedSession(undefined)}
        okText="Replace"
        onOk={replaceSessionDialogAction}
        headline={<T keyName="ReplaceCurrentSession" />}
        textContent={<T keyName="SessionInProgress" />}
      />
    </>
  );
}

export default function Index() {
  const upcomingSessions = useAppSelector((s) => s.program.upcomingSessions);
  const dispatch = useDispatch();
  const { t } = useTranslate();
  useFocusEffect(() => {
    dispatch(fetchUpcomingSessions());
  });

  return (
    <FullHeightScrollView>
      <Stack.Screen
        options={{
          title: t('UpcomingWorkouts'),
        }}
      />
      <AndroidNotificationAlert />
      <Remote
        value={upcomingSessions}
        success={(upcoming) => {
          if (!upcoming.length) {
            return <NoUpcomingSessions />;
          }
          return (
            <ListUpcomingWorkouts
              upcoming={upcoming.map((x) => Session.fromPOJO(x))}
            />
          );
        }}
      />
    </FullHeightScrollView>
  );
}
