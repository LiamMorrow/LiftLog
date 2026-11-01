import CardActions from '@/components/presentation/foundation/card-actions';
import { Card, CardContent } from '@/components/presentation/foundation/card';
import CardList from '@/components/presentation/foundation/card-list';
import ConfirmationDialog from '@/components/presentation/foundation/confirmation-dialog';
import FullHeightScrollView from '@/components/layout/full-height-scroll-view';
import { NativeIcon } from '@/components/presentation/foundation/native-icon';
import { NativeIconButton } from '@/components/presentation/foundation/native-icon-button';
import ShareIcon from '@expo/material-symbols/share.xml';
import DeleteIcon from '@expo/material-symbols/delete.xml';
import { PageActions } from '@/components/presentation/foundation/page-actions';
import FitnessCenterIcon from '@expo/material-symbols/fitness_center.xml';
import { NativeButton } from '@/components/presentation/foundation/native-button';
import PlayCircleIcon from '@expo/material-symbols/play_circle.xml';
import EditIcon from '@expo/material-symbols/edit.xml';
import { useFormatDate } from '@/hooks/useFormatDate';
import PlanMenu, { usePlanNavigation } from '@/components/smart/plan-menu';
import { Remote } from '@/components/presentation/foundation/remote';
import SessionSummary from '@/components/presentation/summary/session-summary';
import SessionSummaryTitle from '@/components/presentation/summary/session-summary-title';
import SplitCardControl from '@/components/presentation/foundation/split-card-control';
import { TitledSection } from '@/components/presentation/foundation/titled-section';
import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import { Session } from '@/models/session-models';
import { useAppSelector, useAppSelectorWhenFocused } from '@/store';
import { deleteStoredSession, selectActiveSession } from '@/store/stored-sessions';
import { encryptAndShare, publishUnpublishedSessions } from '@/store/feed';
import { fetchUpcomingSessions, selectActiveProgram } from '@/store/program';
import { executeRemoteBackup } from '@/store/settings';
import { LocalDate } from '@js-joda/core';
import { useTranslate } from '@tolgee/react';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { AppText } from '@/components/presentation/foundation/app-text';
import { useDispatch } from 'react-redux';
import { WelcomeWizard } from '@/components/smart/welcome-wizard';
import { WhatsNewBanner } from '@/components/smart/whats-new-banner';
import { SharedSession } from '@/models/feed-models';
import { useStartWorkoutWithConfirmation } from '@/hooks/useStartWorkoutWithConfirmation';
import { useStreakStats } from '@/hooks/useStreakStats';
import { useStreakToolbarItem } from '@/components/smart/streak-toolbar-item';

function ListUpcomingWorkouts({
  upcoming,
  startSession,
}: {
  upcoming: readonly Session[];
  startSession: (s: Session) => void;
}) {
  const plan = useAppSelector(selectActiveProgram);
  const { t } = useTranslate();
  const { colors } = useAppTheme();
  const formatDate = useFormatDate();
  const currentSession = useAppSelectorWhenFocused(selectActiveSession);
  const planId = useAppSelector((x) => x.program.activePlanId);
  const { push } = useRouter();
  const dispatch = useDispatch();
  const [confirmDeleteSessionOpen, setConfirmDeleteSessionOpen] = useState(false);
  const clearCurrentSession = () => {
    if (currentSession) {
      dispatch(deleteStoredSession(currentSession.id));
    }
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
      <WhatsNewBanner />
      {currentSession && (
        <TitledSection
          style={{ marginTop: spacing[2] }}
          title={t('workout.current.title')}
          trailing={formatDate(currentSession.date, {
            year: currentSession.date.year() !== LocalDate.now().year() ? 'numeric' : undefined,
            day: 'numeric',
            weekday: 'long',
            month: 'long',
          })}
        >
          <Card>
            <CardContent style={{ paddingBottom: 0 }}>
              <SessionCardContent session={currentSession} />
            </CardContent>
            <CardActions style={{ marginTop: spacing[2] }}>
              <NativeIconButton
                icon={ShareIcon}
                systemImage="square.and.arrow.up"
                colors={{ content: colors.primary }}
                label={t('workout.share_workout.button')}
                onPress={() => handleSharePress(currentSession)}
              />
              <NativeIconButton
                testID="clear-current-workout"
                icon={DeleteIcon}
                systemImage="trash"
                colors={{ content: colors.primary }}
                label={t('workout.clear_current.button')}
                onPress={() => setConfirmDeleteSessionOpen(true)}
              />
              <NativeButton
                icon={PlayCircleIcon}
                systemImage="play.circle"
                testID="resume-workout-button"
                label={t('workout.resume.button')}
                onPress={() => startSession(currentSession)}
              />
            </CardActions>
          </Card>
        </TitledSection>
      )}
      {upcoming.length ? (
        <TitledSection style={{ marginTop: spacing[2] }} title={t('workout.upcoming.title')} trailing={plan.name}>
          <CardList
            keySelector={(x) => x.id}
            items={upcoming}
            renderItemContent={(session) => {
              return (
                <CardContent style={{ paddingBottom: 0 }}>
                  <SessionCardContent session={session} />
                </CardContent>
              );
            }}
            renderItemActions={(session) => {
              const sessionPlanIndex = plan.sessions.findIndex((x) => x.equals(session.blueprint));
              const handleEditPress = () => {
                push(`/plan-workout-editor/${planId}/${sessionPlanIndex}`);
              };
              return (
                <CardActions style={{ marginTop: spacing[2] }}>
                  <NativeIconButton
                    icon={ShareIcon}
                    systemImage="square.and.arrow.up"
                    colors={{ content: colors.primary }}
                    label={t('workout.share_workout.button')}
                    onPress={() => handleSharePress(session)}
                  />
                  {sessionPlanIndex !== -1 ? (
                    <NativeIconButton
                      icon={EditIcon}
                      systemImage="pencil"
                      colors={{ content: colors.primary }}
                      label={t('generic.edit.button')}
                      onPress={handleEditPress}
                    />
                  ) : undefined}
                  <NativeButton
                    icon={PlayCircleIcon}
                    systemImage="play.circle"
                    testID="start-resume-workout-button"
                    label={session.isStarted ? t('workout.resume.button') : t('workout.start.button')}
                    onPress={() => startSession(session)}
                  />
                </CardActions>
              );
            }}
          />
        </TitledSection>
      ) : currentSession ? undefined : (
        <NoUpcomingWorkouts />
      )}
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
        <NativeIcon icon={FitnessCenterIcon} systemImage="dumbbell" size={40} color={colors.onSurfaceVariant} />
        <AppText variant="titleLarge" style={{ textAlign: 'center' }}>
          {t('plan.no_upcoming_workouts.title')}
        </AppText>
        <AppText variant="bodyMedium" style={{ textAlign: 'center', color: colors.onSurfaceVariant }}>
          {t('plan.no_upcoming_workouts.message')}
        </AppText>
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
      mainContent={<SessionSummary session={session} isFilled={false} showWeight showSets />}
    />
  );
}

export default function Index() {
  const upcomingSessions = useAppSelector((s) => s.program.upcomingSessions);
  const dispatch = useDispatch();
  const { t } = useTranslate();
  const currentBodyweight = upcomingSessions.map((x) => x.at(0)?.bodyweight).unwrapOr(undefined);
  const { start, confirmationDialog } = useStartWorkoutWithConfirmation();
  const streakToolbarItem = useStreakToolbarItem(useStreakStats());

  useFocusEffect(() => {
    dispatch(fetchUpcomingSessions());
    dispatch(publishUnpublishedSessions());
    dispatch(executeRemoteBackup({}));
  });

  const createFreeformSession = () => {
    start(Session.freeformSession(LocalDate.now(), currentBodyweight));
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
      <PlanMenu actions={streakToolbarItem} />
      <Remote
        value={upcomingSessions}
        success={(upcoming) => {
          return <ListUpcomingWorkouts startSession={start} upcoming={upcoming} />;
        }}
      />
      {confirmationDialog}
    </FullHeightScrollView>
  );
}
