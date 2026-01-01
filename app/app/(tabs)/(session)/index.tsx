import CardActions from '@/components/presentation/card-actionts';
import CardList from '@/components/presentation/card-list';
import ConfirmationDialog from '@/components/presentation/confirmation-dialog';
import FloatingBottomContainer from '@/components/presentation/floating-bottom-container';
import FullHeightScrollView from '@/components/presentation/full-height-scroll-view';
import IconButton from '@/components/presentation/gesture-wrappers/icon-button';
import { Remote } from '@/components/presentation/remote';
import SessionSummary from '@/components/presentation/session-summary';
import SessionSummaryTitle from '@/components/presentation/session-summary-title';
import SplitCardControl from '@/components/presentation/split-card-control';
import { spacing } from '@/hooks/useAppTheme';
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
import { Card, FAB, Text, Tooltip } from 'react-native-paper';
import Button from '@/components/presentation/gesture-wrappers/button';
import { useDispatch } from 'react-redux';
import { useDebouncedCallback } from 'use-debounce';
import { MigrateToWeightUnitsWizard } from '@/components/smart/migrate-to-weight-units';
import { WelcomeWizard } from '@/components/smart/welcome-wizard';
import { SessionDiffSaveDialog } from '@/components/smart/session-diff-save-dialog';

function PlanManager() {
  const { push } = useRouter();

  const activeProgramId = useAppSelector(
    (s: RootState) => s.program.activeProgramId,
  );

  return (
    <View style={{ flexDirection: 'row', gap: spacing[2] }}>
      <Button
        mode="outlined"
        style={{ flex: 1 }}
        icon={'assignment'}
        onPress={() => push(`/settings/program-list`, { withAnchor: true })}
      >
        <T keyName="plan.choose.button" />
      </Button>
      <Button
        mode="contained-tonal"
        style={{ flex: 1 }}
        icon={'edit'}
        onPress={() =>
          push(`/settings/manage-workouts/${activeProgramId}`, {
            withAnchor: true,
          })
        }
      >
        <T keyName="workout.edit_workouts.button" />
      </Button>
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
  const { t } = useTranslate();
  const currentSession = useAppSelectorWithArg(
    selectCurrentSession,
    'workoutSession',
  );
  const planId = useAppSelector((x) => x.program.activeProgramId);
  const { push } = useRouter();
  const dispatch = useDispatch();
  const [confirmDeleteSessionOpen, setConfirmDeleteSessionOpen] =
    useState(false);
  const clearCurrentSession = () => {
    dispatch(
      setCurrentSession({ session: undefined, target: 'workoutSession' }),
    );
    dispatch(fetchUpcomingSessions());
  };
  return (
    <View style={{ flex: 1, gap: spacing[2], paddingTop: spacing[4] }}>
      <SessionDiffSaveDialog />
      <WelcomeWizard />
      <PlanManager />
      {currentSession && (
        <>
          <Text style={{ marginTop: spacing[2] }} variant="titleSmall">
            {t('workout.current.title')}
          </Text>
          <Card mode="contained">
            <Card.Content>
              <SessionCardContent session={currentSession} />
            </Card.Content>
            <CardActions style={{ marginTop: spacing[2] }}>
              <Tooltip title={t('workout.clear_current.button')}>
                <IconButton
                  testID="clear-current-workout"
                  icon={'delete'}
                  mode="contained"
                  onPress={() => setConfirmDeleteSessionOpen(true)}
                />
              </Tooltip>
              <Button
                icon={'playCircle'}
                mode="contained"
                testID="resume-workout-button"
                onPress={() => selectSession(currentSession)}
              >
                <T keyName="workout.resume.button" />
              </Button>
            </CardActions>
          </Card>
        </>
      )}
      {!!upcoming.length && (
        <Text style={{ marginTop: spacing[2] }} variant="titleSmall">
          {t('workout.upcoming.title')}
        </Text>
      )}
      <CardList
        cardType="contained"
        items={upcoming}
        renderItemContent={(session) => {
          return (
            <Card.Content>
              <SessionCardContent session={session} />
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
            <CardActions style={{ marginTop: spacing[2] }}>
              {sessionPlanIndex !== -1 ? (
                <IconButton
                  icon={'edit'}
                  mode="contained"
                  onPress={handleEditPress}
                />
              ) : undefined}
              <Button
                mode="contained"
                icon={'playCircle'}
                testID="start-resume-workout-button"
                onPress={() => selectSession(session)}
              >
                {session.isStarted ? (
                  <T keyName="workout.resume.button" />
                ) : (
                  <T keyName="workout.start.button" />
                )}
              </Button>
            </CardActions>
          );
        }}
      />
      <ConfirmationDialog
        headline={t('workout.clear_current.confirm.title')}
        textContent={t('workout.clear_current.confirm.body')}
        okText={t('generic.clear.button')}
        onOk={() => {
          clearCurrentSession();
          setConfirmDeleteSessionOpen(false);
        }}
        open={confirmDeleteSessionOpen}
        onCancel={() => setConfirmDeleteSessionOpen(false)}
      />
    </View>
  );
}

function SessionCardContent({ session }: { session: Session }) {
  return (
    <SplitCardControl
      titleContent={
        <SessionSummaryTitle isFilled={session.isStarted} session={session} />
      }
      mainContent={
        <SessionSummary session={session} isFilled={false} showWeight />
      }
    />
  );
}

export default function Index() {
  const upcomingSessions = useAppSelector((s) => s.program.upcomingSessions);
  // const program = useAppSelector(selectActiveProgram);
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
  // const [hasRedirected, setHasRedirected] = useState(false);
  // const [hasMounted, setHasMounted] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | undefined>();

  // useMountEffect(() => {
  //   setHasMounted(true);
  // });
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
    if (!currentSession || currentSession.equals(session)) {
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
          label={t('workout.freeform.title')}
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
      <MigrateToWeightUnitsWizard />
      <Remote
        value={upcomingSessions}
        success={(upcoming) => {
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
        headline={<T keyName="workout.replace_current.confirm.title" />}
        textContent={<T keyName="workout.replace_in_progress.confirm.body" />}
      />
    </FullHeightScrollView>
  );
}
