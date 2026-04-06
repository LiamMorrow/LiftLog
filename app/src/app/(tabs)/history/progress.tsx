import FullHeightScrollView from '@/components/layout/full-height-scroll-view';
import Button from '@/components/presentation/foundation/gesture-wrappers/button';
import WeightFormat from '@/components/presentation/foundation/weight-format';
import { spacing } from '@/hooks/useAppTheme';
import { useFormatDate } from '@/hooks/useFormatDate';
import { calculatePersonalBests, PersonalBest } from '@/models/personal-bests';
import { Weight } from '@/models/weight';
import { useAppSelector, useAppSelectorWithArg } from '@/store';
import { selectCurrentSession } from '@/store/current-session';
import { selectSession, selectSessions } from '@/store/stored-sessions';
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
