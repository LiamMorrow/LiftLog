import { TitledSection } from '@/components/presentation/foundation/titled-section';
import FullHeightScrollView from '@/components/layout/full-height-scroll-view';
import { PageActions } from '@/components/presentation/foundation/page-actions';
import CloseIcon from '@expo/material-symbols/close.xml';
import { SegmentedGroup } from '@/components/presentation/foundation/segmented-list';
import { SegmentedListSwitch } from '@/components/presentation/foundation/segmented-list-switch';
import { SurfaceText } from '@/components/presentation/foundation/surface-text';
import { MuscleVolumeList } from '@/components/presentation/muscles/muscle-volume-list';
import { ExerciseComparisonList } from '@/components/presentation/workout/exercise-comparison-list';
import { StatTile, StatTiles, StatValue } from '@/components/presentation/workout/stat-tiles';
import { useOwnHistory } from '@/components/smart/own-history-provider';
import { PrRecordSegmentedList, useHistoryRecords } from '@/components/smart/pr-badges';
import { ReactionSummary } from '@/components/smart/reaction-summary';
import { useStreakToolbarItem } from '@/components/smart/streak-toolbar-item';
import { readPreviousComparableSession } from '@/db/sessions';
import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import { useFormatDate } from '@/hooks/useFormatDate';
import { useSession } from '@/hooks/useSession';
import { useSessionsQuery } from '@/hooks/useSessionsQuery';
import { Session } from '@/models/session-models';
import { shortFormatWeightUnit } from '@/models/weight';
import { useAppSelector } from '@/store';
import { setShowPostWorkoutSummary } from '@/store/settings';
import { getSessionReferenceTime, selectActiveSession, selectExercises, selectMuscles } from '@/store/stored-sessions';
import { formatDuration } from '@/utils/format-date';
import { localeDisplayFormatBigNumber } from '@/utils/locale-bignumber';
import { analyseMuscleVolume, completedExerciseSets, indexDescriptorsByName } from '@/utils/muscle-volume';
import { compareExercises, plannedSetCount } from '@/utils/session-comparison';
import { useTranslate } from '@tolgee/react';
import { Href, Stack, useRouter } from 'expo-router';
import { View } from 'react-native';
import { useDispatch } from 'react-redux';
import { Icon } from 'react-native-paper';

export function getPostWorkoutHref(sessionId: string): Href {
  return `/post-workout?sessionId=${encodeURIComponent(sessionId)}`;
}

export function PostWorkout({ sessionId }: { sessionId: string | undefined }) {
  const { t } = useTranslate();
  const { dismiss } = useRouter();
  const session = useSession(sessionId);
  const before = session && getSessionReferenceTime(session);
  const previousSession = useSessionsQuery(
    (db) =>
      session && before
        ? readPreviousComparableSession(db, { id: session.id, name: session.blueprint.name, before })
        : undefined,
    `${session?.id}:${session?.blueprint.name}:${before?.toString()}`,
  );

  return (
    <FullHeightScrollView
      modal
      scrollStyle={{ paddingHorizontal: spacing.pageHorizontalMargin }}
      floatingChildren={
        <PageActions
          primaryKind="commit"
          primary={{
            label: t('generic.close.button'),
            icon: CloseIcon,
            systemImage: 'xmark',
            onPress: () => dismiss(),
          }}
        />
      }
    >
      {session && <PostWorkoutContent session={session} previousSession={previousSession} />}
    </FullHeightScrollView>
  );
}

function PostWorkoutContent({ session, previousSession }: { session: Session; previousSession: Session | undefined }) {
  const { t } = useTranslate();
  const formatDate = useFormatDate();
  const showAccomplishments = useAppSelector((x) => x.settings.showAccomplishments);
  const inProgress = useAppSelector(selectActiveSession)?.id === session.id;
  const streakToolbarItem = useStreakToolbarItem(useOwnHistory().streak);
  const { records, scope } = useHistoryRecords(session.id);
  const shownRecords = showAccomplishments ? (records ?? []) : [];
  const comparisons = compareExercises(session, previousSession, inProgress);

  return (
    <>
      <Stack.Screen options={{ title: session.blueprint.name }} />
      <Stack.Toolbar placement="right">{streakToolbarItem}</Stack.Toolbar>
      <View testID="post-workout" style={{ gap: spacing[6], paddingTop: spacing[2], paddingBottom: spacing[12] }}>
        <View style={{ gap: spacing[4] }}>
          <SurfaceText font="text-sm" color="onSurfaceVariant">
            {formatDate(session.date, { weekday: 'long', day: 'numeric', month: 'long' })}
          </SurfaceText>
          <SessionStatTiles
            session={session}
            recordCount={shownRecords.length}
            recordExercises={[...new Set(shownRecords.map((x) => x.exerciseName))].join(', ')}
          />
          <ReactionSummary eventId={session.id} animateOnMount />
        </View>
        {shownRecords.length > 0 && (
          <TitledSection title={t('workout.post_workout.records.title')}>
            <PrRecordSegmentedList records={shownRecords} scope={scope} />
          </TitledSection>
        )}
        {comparisons.length > 0 && (
          <TitledSection
            title={
              previousSession
                ? t('workout.post_workout.compared_with.title', {
                    date: formatDate(previousSession.date, { weekday: 'short', day: 'numeric', month: 'short' }),
                  })
                : t('workout.post_workout.exercises.title')
            }
          >
            <ExerciseComparisonList comparisons={comparisons} />
          </TitledSection>
        )}
        <MusclesWorked session={session} />
        {!inProgress && <DontShowAgain />}
      </View>
    </>
  );
}

function DontShowAgain() {
  const { t } = useTranslate();
  const dispatch = useDispatch();
  const showPostWorkoutSummary = useAppSelector((x) => x.settings.showPostWorkoutSummary);

  return (
    <SegmentedGroup>
      <SegmentedListSwitch
        testID="post-workout-dont-show-again"
        label={t('workout.post_workout.dont_show_again.label')}
        supportingText={t('workout.post_workout.dont_show_again.subtitle')}
        value={!showPostWorkoutSummary}
        onValueChange={(value) => dispatch(setShowPostWorkoutSummary(!value))}
      />
    </SegmentedGroup>
  );
}

function SessionStatTiles(props: { session: Session; recordCount: number; recordExercises: string }) {
  const { t } = useTranslate();
  const { colors } = useAppTheme();
  const { session } = props;
  const volume = session.totalWeightLifted;

  const tiles: (StatTile | false | undefined)[] = [
    session.duration && {
      key: 'time',
      label: t('workout.post_workout.time.label'),
      value: <StatValue>{formatDuration(session.duration, 'hours-mins')}</StatValue>,
    },
    {
      key: 'sets',
      label: t('workout.post_workout.sets.label'),
      value: <StatValue suffix={` / ${plannedSetCount(session)}`}>{session.completedSetCount}</StatValue>,
    },
    !volume.value.isZero() && {
      key: 'volume',
      label: t('workout.post_workout.volume.label'),
      value: (
        <StatValue suffix={` ${shortFormatWeightUnit(volume.unit)}`}>
          {localeDisplayFormatBigNumber(volume.value, 0)}
        </StatValue>
      ),
    },
    props.recordCount > 0 && {
      key: 'records',
      label: t('workout.post_workout.records.title'),
      value: (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[1] }}>
          <Icon source="trophy" size={22} color={colors.onGoldContainer} />
          <StatValue color="onGoldContainer">{props.recordCount}</StatValue>
        </View>
      ),
      caption: props.recordExercises,
      gold: true,
    },
  ];

  return <StatTiles tiles={tiles.filter((tile): tile is StatTile => !!tile)} />;
}

function MusclesWorked({ session }: { session: Session }) {
  const { t } = useTranslate();
  const exercises = useAppSelector(selectExercises);
  const allMuscles = useAppSelector(selectMuscles);
  const analysis = analyseMuscleVolume(completedExerciseSets(session), indexDescriptorsByName(exercises), allMuscles);
  const worked = analysis.muscles.filter((x) => x.sets > 0);

  if (!worked.length) {
    return null;
  }

  return (
    <TitledSection
      title={t('workout.post_workout.muscles.title')}
      trailing={t('workout.post_workout.muscle_sets.label')}
    >
      <MuscleVolumeList muscles={worked} />
      <SurfaceText font="text-sm" color="onSurfaceVariant">
        {t('workout.post_workout.secondary_muscles.body')}
      </SurfaceText>
      {analysis.unmatchedExercises.length > 0 && (
        <SurfaceText font="text-sm" color="onSurfaceVariant">
          {t('workout.post_workout.unmatched_muscles.body', {
            names: analysis.unmatchedExercises.map((x) => x.name).join(', '),
          })}
        </SurfaceText>
      )}
    </TitledSection>
  );
}
