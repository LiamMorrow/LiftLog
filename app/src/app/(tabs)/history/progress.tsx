import FullHeightScrollView from '@/components/layout/full-height-scroll-view';
import Button from '@/components/presentation/foundation/gesture-wrappers/button';
import { SingleValueStatisticsGrid } from '@/components/presentation/stats/single-value-statistics-grid';
import SingleValueStatisticCard from '@/components/presentation/stats/single-value-statistic-card';
import { TitledSection } from '@/components/presentation/stats/titled-section';
import { WeightBarChart } from '@/components/presentation/stats/weight-bar-chart';
import { WeightLineChart } from '@/components/presentation/stats/weight-line-chart';
import { NormalizedName } from '@/models/blueprint-models';
import WeightFormat from '@/components/presentation/foundation/weight-format';
import { spacing } from '@/hooks/useAppTheme';
import { calculatePersonalBests, PersonalBest } from '@/models/personal-bests';
import { RecordedWeightedExercise, Session } from '@/models/session-models';
import { Weight } from '@/models/weight';
import { useFormatDate } from '@/hooks/useFormatDate';
import { useAppSelector, useAppSelectorWithArg } from '@/store';
import { selectCurrentSession } from '@/store/current-session';
import { selectSession, selectSessions } from '@/store/stored-sessions';
import { TimeTrackedStatistic, WeightedStatisticOverTime } from '@/store/stats';
import { ZoneId } from '@js-joda/core';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { Card, Text } from 'react-native-paper';

function PersonalBestCard({ personalBest }: { personalBest: PersonalBest }) {
  return (
    <Card mode="contained">
      <Card.Content style={{ gap: spacing[2] }}>
        <Text variant="titleMedium">{getPersonalBestTitle(personalBest)}</Text>
        <View>{getPersonalBestValue(personalBest)}</View>
        {personalBest.previousValue !== undefined ? (
          <Text variant="bodySmall">
            Previous best: {getPreviousBestValue(personalBest)}
          </Text>
        ) : (
          <Text variant="bodySmall">
            First recorded result for this metric.
          </Text>
        )}
      </Card.Content>
    </Card>
  );
}

export default function ProgressScreen() {
  const { sessionId, source } = useLocalSearchParams<{
    sessionId?: string;
    source?: string;
  }>();
  const formatDate = useFormatDate();
  const { dismissTo } = useRouter();
  const storedSession = useAppSelectorWithArg(selectSession, sessionId ?? '');
  const historySession = useAppSelectorWithArg(
    selectCurrentSession,
    'historySession',
  );
  const workoutSession = useAppSelectorWithArg(
    selectCurrentSession,
    'workoutSession',
  );
  const allSessions = useAppSelector(selectSessions);
  const session =
    storedSession ??
    (historySession?.id === sessionId ? historySession : undefined) ??
    (workoutSession?.id === sessionId ? workoutSession : undefined);

  if (!session) {
    return (
      <>
        <Stack.Screen options={{ title: 'Progress' }} />
        <FullHeightScrollView
          contentContainerStyle={{
            padding: spacing.pageHorizontalMargin,
            justifyContent: 'center',
          }}
        >
          <Text variant="bodyLarge">Loading progress...</Text>
        </FullHeightScrollView>
      </>
    );
  }

  const personalBestSummary = calculatePersonalBests(session, allSessions);
  const workoutVolumeTrend = buildWorkoutVolumeTrend(session, allSessions);
  const exerciseNamesWithPbs = Array.from(
    new Set(
      personalBestSummary.personalBests
        .map((x) => x.exerciseName)
        .filter((x): x is string => !!x),
    ),
  );
  const exerciseTrends = exerciseNamesWithPbs
    .map((exerciseName) => ({
      exerciseName,
      maxWeightTrend: buildExerciseWeightTrend(
        session,
        allSessions,
        exerciseName,
      ),
      volumeTrend: buildExerciseVolumeTrend(session, allSessions, exerciseName),
    }))
    .filter(
      (x) =>
        x.maxWeightTrend.statistics.length > 0 ||
        x.volumeTrend.statistics.length > 0,
    );

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Progress',
        }}
      />
      <FullHeightScrollView
        contentContainerStyle={{
          gap: spacing[4],
          paddingHorizontal: spacing.pageHorizontalMargin,
          paddingVertical: spacing[4],
        }}
      >
        <Card mode="contained">
          <Card.Content style={{ gap: spacing[2] }}>
            <Text variant="headlineSmall">Personal bests</Text>
            <Text variant="bodyMedium">
              {session.blueprint.name} on{' '}
              {formatDate(session.date, {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </Text>
            <Text variant="bodyMedium">
              Compared against {personalBestSummary.previousSessionsCount}{' '}
              previous workout
              {personalBestSummary.previousSessionsCount === 1 ? '' : 's'}.
            </Text>
          </Card.Content>
        </Card>

        <TitledSection title="Overview">
          <SingleValueStatisticsGrid>
            <SingleValueStatisticCard
              title="PBs hit"
              icon="analytics"
              value={personalBestSummary.personalBests.length.toString()}
            />
            <SingleValueStatisticCard
              title="Workout volume"
              icon="fitnessCenter"
              value={<WeightFormat weight={session.totalWeightLifted} />}
            />
            <SingleValueStatisticCard
              title="Exercises with PBs"
              icon="analytics"
              value={exerciseTrends.length.toString()}
            />
          </SingleValueStatisticsGrid>
        </TitledSection>

        {personalBestSummary.personalBests.length ? (
          personalBestSummary.personalBests.map((personalBest, index) => (
            <PersonalBestCard
              key={`${personalBest.kind}-${personalBest.exerciseName ?? 'workout'}-${index}`}
              personalBest={personalBest}
            />
          ))
        ) : (
          <Card mode="contained">
            <Card.Content style={{ gap: spacing[2] }}>
              <Text variant="titleMedium">No new personal bests this time</Text>
              <Text variant="bodyMedium">
                This workout still counts. Consistency adds up.
              </Text>
            </Card.Content>
          </Card>
        )}

        {workoutVolumeTrend.statistics.length > 0 ? (
          <TitledSection title="Workout volume trend">
            <Card mode="contained">
              <Card.Content style={{ paddingVertical: spacing[8] }}>
                <WeightBarChart statistics={workoutVolumeTrend} />
              </Card.Content>
            </Card>
          </TitledSection>
        ) : null}

        {exerciseTrends.map((exerciseTrend) => (
          <View key={exerciseTrend.exerciseName} style={{ gap: spacing[4] }}>
            {exerciseTrend.maxWeightTrend.statistics.length > 0 ? (
              <TitledSection
                title={`${exerciseTrend.exerciseName} weight trend`}
              >
                <Card mode="contained">
                  <Card.Content style={{ paddingVertical: spacing[8] }}>
                    <WeightLineChart
                      statistics={exerciseTrend.maxWeightTrend}
                    />
                  </Card.Content>
                </Card>
              </TitledSection>
            ) : null}
            {exerciseTrend.volumeTrend.statistics.length > 0 ? (
              <TitledSection
                title={`${exerciseTrend.exerciseName} volume trend`}
              >
                <Card mode="contained">
                  <Card.Content style={{ paddingVertical: spacing[8] }}>
                    <WeightBarChart statistics={exerciseTrend.volumeTrend} />
                  </Card.Content>
                </Card>
              </TitledSection>
            ) : null}
          </View>
        ))}

        <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
          <Button
            mode="contained"
            icon={source === 'finish' ? 'check' : 'history'}
            onPress={() => dismissTo('/history')}
          >
            {source === 'finish' ? 'Done' : 'Back to history'}
          </Button>
        </View>
      </FullHeightScrollView>
    </>
  );
}

function getPersonalBestTitle(personalBest: PersonalBest) {
  switch (personalBest.kind) {
    case 'workoutVolume':
      return 'Workout volume PB';
    case 'exerciseVolume':
      return `${personalBest.exerciseName} volume PB`;
    case 'weight':
      return `${personalBest.exerciseName} weight PB`;
    case 'repsAtWeight':
      return `${personalBest.exerciseName} reps PB`;
  }
}

function getWeightLine(weight: PersonalBest['value'] | PersonalBest['weight']) {
  return weight instanceof Weight ? <WeightFormat weight={weight} /> : null;
}

function getPersonalBestValue(personalBest: PersonalBest) {
  switch (personalBest.kind) {
    case 'workoutVolume':
    case 'exerciseVolume':
    case 'weight':
      return <View>{getWeightLine(personalBest.value)}</View>;
    case 'repsAtWeight':
      return (
        <Text variant="bodyMedium">
          {personalBest.reps} reps at {personalBest.weight?.shortLocaleFormat()}
        </Text>
      );
  }
}

function getPreviousBestValue(personalBest: PersonalBest) {
  if (typeof personalBest.previousValue === 'number') {
    return `${personalBest.previousValue} reps`;
  }
  return personalBest.previousValue?.shortLocaleFormat() ?? '-';
}

function getChronologicalPoint(session: Session) {
  return (
    session.lastExercise?.latestTime ??
    session.date
      .atStartOfDay()
      .atZone(ZoneId.systemDefault())
      .toOffsetDateTime()
  );
}

function getSessionsUpTo(session: Session, allSessions: Session[]) {
  return [...allSessions]
    .filter((candidate) => {
      const candidatePoint = getChronologicalPoint(candidate);
      const sessionPoint = getChronologicalPoint(session);
      return (
        candidate.date.isBefore(session.date) ||
        (candidate.date.isEqual(session.date) &&
          candidatePoint.compareTo(sessionPoint) <= 0)
      );
    })
    .sort((a, b) =>
      getChronologicalPoint(a).compareTo(getChronologicalPoint(b)),
    );
}

function buildWorkoutVolumeTrend(
  session: Session,
  allSessions: Session[],
): WeightedStatisticOverTime {
  return buildWeightedStatistic(
    getSessionsUpTo(session, allSessions).map((candidate) => ({
      dateTime: getChronologicalPoint(candidate),
      value: candidate.totalWeightLifted,
    })),
  );
}

function buildExerciseWeightTrend(
  session: Session,
  allSessions: Session[],
  exerciseName: string,
): WeightedStatisticOverTime {
  return buildWeightedStatistic(
    getSessionsUpTo(session, allSessions)
      .map((candidate) => {
        const matchingExercises = candidate.recordedExercises.filter(
          (exercise): exercise is RecordedWeightedExercise =>
            exercise instanceof RecordedWeightedExercise &&
            new NormalizedName(exercise.blueprint.name).equals(
              new NormalizedName(exerciseName),
            ) &&
            exercise.isStarted,
        );
        const maxWeight = matchingExercises
          .flatMap((exercise) => exercise.potentialSets)
          .filter((set) => set.set)
          .map((set) => set.weight)
          .reduce(
            (currentMax, weight) =>
              !currentMax || weight.isGreaterThan(currentMax)
                ? weight
                : currentMax,
            undefined as Weight | undefined,
          );

        return maxWeight
          ? {
              dateTime: getChronologicalPoint(candidate),
              value: maxWeight,
            }
          : undefined;
      })
      .filter(
        (stat): stat is TimeTrackedStatistic<Weight> => stat !== undefined,
      ),
  );
}

function buildExerciseVolumeTrend(
  session: Session,
  allSessions: Session[],
  exerciseName: string,
): WeightedStatisticOverTime {
  return buildWeightedStatistic(
    getSessionsUpTo(session, allSessions)
      .map((candidate) => {
        const volume = candidate.recordedExercises
          .filter(
            (exercise): exercise is RecordedWeightedExercise =>
              exercise instanceof RecordedWeightedExercise &&
              new NormalizedName(exercise.blueprint.name).equals(
                new NormalizedName(exerciseName),
              ) &&
              exercise.isStarted,
          )
          .reduce(
            (exerciseTotal, exercise) =>
              exerciseTotal.plus(
                exercise.potentialSets
                  .filter((set) => set.set)
                  .reduce(
                    (setTotal, set) =>
                      setTotal.plus(
                        set.weight.multipliedBy(set.set!.repsCompleted),
                      ),
                    Weight.NIL,
                  ),
              ),
            Weight.NIL,
          );

        return volume.equals(Weight.NIL)
          ? undefined
          : {
              dateTime: getChronologicalPoint(candidate),
              value: volume,
            };
      })
      .filter(
        (stat): stat is TimeTrackedStatistic<Weight> => stat !== undefined,
      ),
  );
}

function buildWeightedStatistic(
  statistics: TimeTrackedStatistic<Weight>[],
): WeightedStatisticOverTime {
  if (!statistics.length) {
    return {
      statistics: [],
      currentValue: Weight.NIL,
      totalValue: Weight.NIL,
      maxValue: Weight.NIL,
      minValue: Weight.NIL,
    };
  }

  return statistics.reduce<WeightedStatisticOverTime>(
    (accum, statistic, index) => ({
      statistics: [...accum.statistics, statistic],
      currentValue: statistic.value,
      totalValue: accum.totalValue.plus(statistic.value),
      maxValue:
        index === 0 || statistic.value.isGreaterThan(accum.maxValue)
          ? statistic.value
          : accum.maxValue,
      minValue:
        index === 0 || accum.minValue.isGreaterThan(statistic.value)
          ? statistic.value
          : accum.minValue,
    }),
    {
      statistics: [],
      currentValue: Weight.NIL,
      totalValue: Weight.NIL,
      maxValue: Weight.NIL,
      minValue: Weight.NIL,
    },
  );
}
