import CardList from '@/components/presentation/card-list';
import ConfirmationDialog from '@/components/presentation/confirmation-dialog';
import FloatingBottomContainer from '@/components/presentation/floating-bottom-container';
import FullHeightScrollView from '@/components/presentation/full-height-scroll-view';
import { Remote } from '@/components/presentation/remote';
import SessionSummary from '@/components/presentation/session-summary';
import SessionSummaryTitle from '@/components/presentation/session-summary-title';
import SplitCardControl from '@/components/presentation/split-card-control';
import { SurfaceText } from '@/components/presentation/surface-text';
import AndroidNotificationAlert from '@/components/smart/android-notification-alert';
import { Tips } from '@/components/smart/tips';
import { spacing } from '@/hooks/useAppTheme';
import { useMountEffect } from '@/hooks/useMountEffect';
import { Session } from '@/models/session-models';
import { RootState, useAppSelector, useAppSelectorWithArg } from '@/store';
import {
  selectCurrentSession,
  setCurrentSession,
} from '@/store/current-session';
import { publishUnpublishedSessions } from '@/store/feed';
import { fetchUpcomingSessions, selectActiveProgram } from '@/store/program';
import { setEditingSession } from '@/store/session-editor';
import { executeRemoteBackup } from '@/store/settings';
import { LocalDate } from '@js-joda/core';
import { T, useTranslate } from '@tolgee/react';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { Button, Card, FAB, Icon, IconButton } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { useDebouncedCallback } from 'use-debounce';

function NoUpcomingSessions() {
  const { push } = useRouter();

  const activeProgramId = useAppSelector(
    (s: RootState) => s.program.activeProgramId,
  );
  return (
    <View
      style={{
        gap: spacing[2],
      }}
    >
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
                push(`/settings/manage-workouts/${activeProgramId}`, {
                  withAnchor: true,
                })
              }
            >
              <T keyName="AddWorkouts" />
            </Button>
            <Button
              mode="contained"
              style={{ flex: 1 }}
              icon={'assignment'}
              onPress={() =>
                push(`/settings/program-list`, { withAnchor: true })
              }
            >
              <T keyName="SelectAPlan" />
            </Button>
          </View>
        </Card.Content>
      </Card>
    </View>
  );
}

function ListUpcomingWorkouts({
  upcoming,
  selectSession,
}: {
  upcoming: readonly Session[];
  selectSession: (s: Session) => void;
}) {
  const plan = useAppSelector(selectActiveProgram);
  const planId = useAppSelector((x) => x.program.activeProgramId);
  const { push } = useRouter();
  const dispatch = useDispatch();
  return (
    <>
      <View style={{ margin: spacing.pageHorizontalMargin }}>
        <Tips />
      </View>
      <CardList
        cardType="contained"
        items={upcoming}
        renderItemContent={(session) => {
          return (
            <Card.Content>
              <SplitCardControl
                titleContent={
                  <SessionSummaryTitle
                    isFilled={session.isStarted}
                    session={session}
                  />
                }
                mainContent={
                  <SessionSummary
                    session={session}
                    isFilled={false}
                    showWeight
                  />
                }
              />
            </Card.Content>
          );
        }}
        renderItemActions={(session) => {
          const sessionPlanIndex = plan.sessions.findIndex((x) =>
            x.equals(session.blueprint),
          );
          const handleEditPress = () => {
            dispatch(setEditingSession(session.blueprint));
            push(
              `/(tabs)/settings/manage-workouts/${planId}/manage-session/${sessionPlanIndex}`,
              { withAnchor: true },
            );
          };
          return (
            <Card.Actions style={{ marginTop: spacing[2] }}>
              {sessionPlanIndex !== -1 && !session.isStarted ? (
                <IconButton icon={'edit'} onPress={handleEditPress} />
              ) : undefined}
              <Button
                icon={'playCircle'}
                onPress={() => selectSession(session)}
              >
                {session.isStarted ? (
                  <T keyName={'Resume workout'} />
                ) : (
                  <T keyName={'Start workout'} />
                )}
              </Button>
            </Card.Actions>
          );
        }}
      />
    </>
  );
}

export default function Index() {
  const upcomingSessions = useAppSelector((s) => s.program.upcomingSessions);
  const program = useAppSelector(selectActiveProgram);
  const dispatch = useDispatch();
  const { t } = useTranslate();
  const { push } = useRouter();
  const currentSession = useAppSelectorWithArg(
    selectCurrentSession,
    'workoutSession',
  );
  const currentBodyweight = upcomingSessions
    .map((x) => x.at(0)?.bodyweight)
    .unwrapOr(undefined);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  // const rootNavigationState = useRootNavigationState();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  // const navigatorReady = rootNavigationState?.key != null;
  const [hasRedirected, setHasRedirected] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | undefined>();

  useMountEffect(() => {
    setHasMounted(true);
  });
  // useEffect(() => {
  //   if (!navigatorReady || !hasMounted) return;
  //   // On app open from cold if we have a current session loaded, show it automatically.
  //   if (currentSession?.isStarted && !hasRedirected) {
  //     push('/(tabs)/(session)/session');
  //   }
  //   setHasRedirected(true);
  // }, [
  //   navigatorReady,
  //   hasRedirected,
  //   currentSession?.isStarted,
  //   push,
  //   hasMounted,
  // ]);

  useFocusEffect(() => {
    dispatch(fetchUpcomingSessions());
    dispatch(publishUnpublishedSessions());
    dispatch(executeRemoteBackup({}));
  });

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
          session,
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

  const createFreeformSession = () => {
    const newSession = Session.freeformSession(
      LocalDate.now(),
      currentBodyweight,
    );
    selectSession(newSession);
  };

  const floatingBottomContainer = (
    <FloatingBottomContainer
      fab={
        <FAB
          variant="surface"
          size="small"
          icon="fitnessCenter"
          label={t('Freeform Session')}
          onPress={createFreeformSession}
        />
      }
    />
  );

  return (
    <FullHeightScrollView
      floatingChildren={floatingBottomContainer}
      scrollStyle={{ paddingHorizontal: spacing.pageHorizontalMargin }}
    >
      <Stack.Screen
        options={{
          title: 'LiftLog',
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
              selectSession={selectSession}
              upcoming={upcoming.map((x) => Session.fromPOJO(x))}
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
    </FullHeightScrollView>
  );
}
