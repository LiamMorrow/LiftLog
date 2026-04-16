import { describe, expect, it, vi } from 'vitest';
import { LocalDate, ZoneId } from '@js-joda/core';
import { benchPress } from '@/models/test-data';
import {
  PotentialSetPOJO,
  RecordedWeightedExercise,
  Session,
} from '@/models/session-models';
import { Weight } from '@/models/weight';
import {
  getWeightedExercisePersonalBestPills,
  type PersonalBestPill,
} from '@/utils/personal-bests';

vi.mock('expo-localization', () => ({
  getLocales: () => [
    {
      decimalSeparator: '.',
    },
  ],
}));

function buildSession(
  id: string,
  date: LocalDate,
  exercise: RecordedWeightedExercise,
) {
  return Session.fromPOJO({
    id,
    blueprint: {
      type: 'SessionBlueprint',
      name: 'Workout',
      notes: '',
      exercises: [exercise.blueprint.toPOJO()],
    },
    recordedExercises: [exercise.toPOJO()],
    date,
    bodyweight: undefined,
  });
}

function buildWeightedExercise(
  weight: number,
  reps: number,
  date: LocalDate,
) {
  const completionDateTime = date
    .atTime(10, 0)
    .atZone(ZoneId.systemDefault())
    .toOffsetDateTime();

  return benchPress.with({
    potentialSets: [
      {
        type: 'PotentialSet',
        weight: new Weight(weight, 'kilograms'),
        set: {
          type: 'RecordedSet',
          repsCompleted: reps,
          completionDateTime,
        },
      } satisfies PotentialSetPOJO,
      {
        type: 'PotentialSet',
        weight: new Weight(weight, 'kilograms'),
        set: {
          type: 'RecordedSet',
          repsCompleted: reps,
          completionDateTime,
        },
      } satisfies PotentialSetPOJO,
    ],
  });
}

describe('getWeightedExercisePersonalBestPills', () => {
  it('returns compact PB pills for a current workout exercise', () => {
    const currentDate = LocalDate.of(2026, 4, 16);
    const previousDate = LocalDate.of(2026, 4, 9);
    const currentExercise = buildWeightedExercise(101, 11, currentDate);
    const previousExercise = buildWeightedExercise(100, 10, previousDate);
    const currentSession = buildSession('current', currentDate, currentExercise);
    const previousSession = buildSession(
      'previous',
      previousDate,
      previousExercise,
    );

    const pills = getWeightedExercisePersonalBestPills(
      [previousSession],
      currentSession,
      currentExercise,
      'kilograms',
    );

    expect(pills).toEqual<PersonalBestPill[]>([
      {
        key: 'weighted:bench pres:estimated-1rm',
        label: 'eRM+4%',
        ariaLabel: 'progress.pbs.category.estimated_1rm',
      },
      {
        key: 'weighted:bench pres:session-volume',
        label: 'TW+11%',
        ariaLabel: 'progress.pbs.category.session_volume',
      },
      {
        key: 'weighted:bench pres:max-weight',
        label: 'MW+1%',
        ariaLabel: 'progress.pbs.category.max_weight',
      },
      {
        key: 'weighted:bench pres:reps-at-weight',
        label: 'R@W+1',
        ariaLabel: 'progress.pbs.category.reps_at_weight',
      },
    ]);
  });

  it('omits the delta when there is no previous personal best', () => {
    const currentDate = LocalDate.of(2026, 4, 16);
    const currentExercise = buildWeightedExercise(101, 10, currentDate);
    const currentSession = buildSession('current', currentDate, currentExercise);

    const pills = getWeightedExercisePersonalBestPills(
      [],
      currentSession,
      currentExercise,
      'kilograms',
    );

    expect(pills.map((pill) => pill.label)).toEqual([
      'eRM',
      'TW',
      'MW',
      'R@W',
    ]);
  });
});
