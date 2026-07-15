import CardActions from '@/components/presentation/foundation/card-actions';
import CardList from '@/components/presentation/foundation/card-list';
import ConfirmationDialog from '@/components/presentation/foundation/confirmation-dialog';
import FullHeightScrollView from '@/components/layout/full-height-scroll-view';
import IconButton from '@/components/presentation/foundation/gesture-wrappers/icon-button';
import { PageActions } from '@/components/presentation/foundation/page-actions';
import FitnessCenterIcon from '@expo/material-symbols/fitness_center.xml';
import NativeButton from '@/components/presentation/foundation/native-button';
import EditIcon from '@expo/material-symbols/edit.xml';
import { useFormatDate } from '@/hooks/useFormatDate';
import PlanMenu, { usePlanNavigation } from '@/components/smart/plan-menu';
import { Remote } from '@/components/presentation/foundation/remote';
import SessionSummary from '@/components/presentation/summary/session-summary';
import SessionSummaryTitle from '@/components/presentation/summary/session-summary-title';
import SplitCardControl from '@/components/presentation/foundation/split-card-control';
import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import { Session } from '@/models/session-models';
import { useAppSelector, useAppSelectorWhenFocusedWithArg } from '@/store';
import { selectCurrentSession, setCurrentSession } from '@/store/current-session';
import { encryptAndShare, publishUnpublishedSessions } from '@/store/feed';
import { fetchUpcomingSessions, selectActiveProgram } from '@/store/program';
import { setEditingSession } from '@/store/session-editor';
import { executeRemoteBackup } from '@/store/settings';
import { LocalDate } from '@js-joda/core';
import { T, useTranslate } from '@tolgee/react';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { Card, Icon as PaperIcon, Text, Tooltip } from 'react-native-paper';
import Button from '@/components/presentation/foundation/gesture-wrappers/button';
import { useDispatch } from 'react-redux';
import { WelcomeWizard } from '@/components/smart/welcome-wizard';
import { SharedSession } from '@/models/feed-models';
import { CurrentWorkoutReplacer } from '@/components/smart/current-workout-replacer';

function ListUpcomingWorkouts({
  upcoming,
  selectSession,
}: {
  upcoming: readonly Session[];
  selectSession: (s: Session) => void;
}) {
  const plan = useAppSelector(selectActiveProgram);
  const { t } = useTranslate();
  const formatDate = useFormatDate();
  const currentSession = useAppSelectorWhenFocusedWithArg(selectCurrentSession, 'workoutSession');
  const planId = useAppSelector((x) => x.program.activePlanId);
  const { push } = useRouter();
  const dispatch = useDispatch();
  const [confirmDeleteSessionOpen, setConfirmDeleteSessionOpen] = useState(false);
  const clearCurrentSession = () => {
    dispatch(setCurrentSession({ session: undefined, target: 'workoutSession' }));
    dispatch(fetchUpcomingSessions());
  };
  const handleSharePress = (session: Session) => {
    dispatch(
      encryptAndShare({
        item: new SharedSession(session),
        title: t('workout.shared_item.title'),
      }),
    );
  };

  return (
    <View style={{ flex: 1, gap: spacing[2], paddingTop: spacing[4] }}>
      <WelcomeWizard />
      {currentSession && (
        <>
          <SectionHeader
            title={t('workout.current.title')}
            trailing={formatDate(currentSession.date, {
              year: currentSession.date.year() !== LocalDate.now().year() ? 'numeric' : undefined,
              day: 'numeric',
              weekday: 'long',
              month: 'long',
            })}
          />
          <Card mode="contained">
            <Card.Content>
              <SessionCardContent session={currentSession} />
            </Card.Content>
            <CardActions style={{ marginTop: spacing[2] }}>
              <Tooltip title={t('workout.share_workout.button')}>
                <IconButton icon={'share'} mode="contained" onPress={() => handleSharePress(currentSession)} />
              </Tooltip>
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
      {!!upcoming.length && <SectionHeader title={t('workout.upcoming.title')} trailing={plan.name} />}
      <CardList
        keySelector={(x) => x.id}
        cardType="contained"
        items={upcoming}
        emptyTemplate={currentSession ? undefined : <NoUpcomingWorkouts />}
        renderItemContent={(session) => {
          return (
            <Card.Content>
              <SessionCardContent session={session} />
            </Card.Content>
          );
        }}
        renderItemActions={(session) => {
          const sessionPlanIndex = plan.sessions.findIndex((x) => x.equals(session.blueprint));
          const handleEditPress = () => {
            dispatch(setEditingSession(session.blueprint));
            push(`/settings/manage-workouts/${planId}/manage-session/${sessionPlanIndex}`, { withAnchor: true });
          };
          return (
            <CardActions style={{ marginTop: spacing[2] }}>
              <IconButton icon={'share'} mode="contained" onPress={() => handleSharePress(session)} />
              {sessionPlanIndex !== -1 ? (
                <IconButton icon={'edit'} mode="contained" onPress={handleEditPress} />
              ) : undefined}
              <Button
                mode="contained"
                icon={'playCircle'}
                testID="start-resume-workout-button"
                onPress={() => selectSession(session)}
              >
                {session.isStarted ? <T keyName="workout.resume.button" /> : <T keyName="workout.start.button" />}
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

function SectionHeader({ title, trailing }: { title: string; trailing: string }) {
  const { colors } = useAppTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        gap: spacing[4],
        marginTop: spacing[2],
      }}
    >
      <Text variant="titleMedium">{title}</Text>
      <Text variant="bodyMedium" numberOfLines={1} style={{ flexShrink: 1, color: colors.onSurfaceVariant }}>
        {trailing}
      </Text>
    </View>
  );
}

function NoUpcomingWorkouts() {
  const { t } = useTranslate();
  const { colors } = useAppTheme();
  const { choosePlan, editWorkouts } = usePlanNavigation();

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing[8],
        paddingBottom: spacing[12],
        paddingHorizontal: spacing[4],
      }}
    >
      <View style={{ alignItems: 'center', gap: spacing[3] }}>
        <PaperIcon source="fitnessCenter" size={40} color={colors.onSurfaceVariant} />
        <Text variant="titleLarge" style={{ textAlign: 'center' }}>
          {t('plan.no_upcoming_workouts.title')}
        </Text>
        <Text variant="bodyMedium" style={{ textAlign: 'center', color: colors.onSurfaceVariant }}>
          {t('plan.no_upcoming_workouts.message')}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: spacing[2] }}>
        <NativeButton
          variant="filled"
          icon={EditIcon}
          systemImage="pencil"
          label={t('workout.edit_workouts.button')}
          onPress={editWorkouts}
        />
        <NativeButton variant="text" label={t('plan.choose.button')} onPress={choosePlan} />
      </View>
    </View>
  );
}

function SessionCardContent({ session }: { session: Session }) {
  return (
    <SplitCardControl
      titleContent={<SessionSummaryTitle session={session} />}
      mainContent={<SessionSummary session={session} isFilled={false} showWeight />}
    />
  );
}

export default function Index() {
  const upcomingSessions = useAppSelector((s) => s.program.upcomingSessions);
  const dispatch = useDispatch();
  const { t } = useTranslate();
  const currentBodyweight = upcomingSessions.map((x) => x.at(0)?.bodyweight).unwrapOr(undefined);

  const [selectedSession, setSelectedSession] = useState<Session | undefined>();

  useFocusEffect(() => {
    dispatch(fetchUpcomingSessions());
    dispatch(publishUnpublishedSessions());
    dispatch(executeRemoteBackup({}));
  });

  const createFreeformSession = () => {
    const newSession = Session.freeformSession(LocalDate.now(), currentBodyweight);
    setSelectedSession(newSession);
  };

  const floatingBottomContainer = (
    <PageActions
      primary={{
        label: t('workout.freeform.title'),
        icon: FitnessCenterIcon,
        systemImage: 'dumbbell',
        onPress: createFreeformSession,
      }}
    />
  );

  return (
    <FullHeightScrollView
      floatingChildren={floatingBottomContainer}
      scrollStyle={{ paddingHorizontal: spacing.pageHorizontalMargin }}
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <Stack.Screen
        options={{
          title: 'LiftLog',
          headerBackVisible: false,
        }}
      />
      <PlanMenu />
      <Remote
        value={upcomingSessions}
        success={(upcoming) => {
          return <ListUpcomingWorkouts selectSession={setSelectedSession} upcoming={upcoming} />;
        }}
      />
      <CurrentWorkoutReplacer session={selectedSession} clearSession={() => setSelectedSession(undefined)} />
    </FullHeightScrollView>
  );
}
