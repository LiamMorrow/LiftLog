import { Rest } from '@/models/blueprint-models';
import {
  calculatePersonalBests,
  PersonalBestKind,
} from '@/models/personal-bests';
import {
  PotentialSetPOJO,
  RecordedWeightedExercise,
  Session,
} from '@/models/session-models';
import { Weight } from '@/models/weight';
import { LocalDate, OffsetDateTime, ZoneOffset } from '@js-joda/core';
import BigNumber from 'bignumber.js';
import { describe, expect, it } from 'vitest';

function createWeightedExercise(args: {
  name: string;
  date: LocalDate;
  sets: { reps?: number; weight: number; minutesIntoWorkout: number }[];
}): RecordedWeightedExercise {
  return RecordedWeightedExercise.fromPOJO({
    blueprint: {
      type: 'WeightedExerciseBlueprint',
      name: args.name,
      sets: args.sets.length,
      repsPerSet: 5,
      supersetWithNext: false,
      link: '',
      notes: '',
      restBetweenSets: Rest.medium,
      weightIncreaseOnSuccess: new BigNumber('2.5'),
    },
    potentialSets: args.sets.map(
      (set) =>
        ({
          type: 'PotentialSet',
          weight: new Weight(set.weight, 'kilograms'),
          set:
            set.reps === undefined
              ? undefined
              : {
                  type: 'RecordedSet',
                  repsCompleted: set.reps,
                  completionDateTime: OffsetDateTime.of(
                    args.date.year(),
                    args.date.monthValue(),
                    args.date.dayOfMonth(),
                    12,
                    set.minutesIntoWorkout,
                    0,
                    0,
                    ZoneOffset.UTC,
                  ),
                },
        }) satisfies PotentialSetPOJO,
    ),
    notes: '',
  });
}

function createSession(args: {
  id: string;
  date: LocalDate;
  exercises: RecordedWeightedExercise[];
}): Session {
  return Session.fromPOJO({
    id: args.id,
    date: args.date,
    bodyweight: undefined,
    blueprint: {
      type: 'SessionBlueprint',
      name: 'Workout',
      notes: '',
      exercises: args.exercises.map((x) => x.blueprint.toPOJO()),
    },
    recordedExercises: args.exercises.map((x) => x.toPOJO()),
  });
}

describe('calculatePersonalBests', () => {
  it('returns workout, exercise, weight, and reps-at-weight PBs against previous sessions', () => {
    const previousSession = createSession({
      id: 'previous',
      date: LocalDate.of(2026, 4, 4),
      exercises: [
        createWeightedExercise({
          name: 'Bench Press',
          date: LocalDate.of(2026, 4, 4),
          sets: [
            { reps: 5, weight: 100, minutesIntoWorkout: 0 },
            { reps: 5, weight: 100, minutesIntoWorkout: 1 },
          ],
        }),
      ],
    });
    const currentSession = createSession({
      id: 'current',
      date: LocalDate.of(2026, 4, 5),
      exercises: [
        createWeightedExercise({
          name: 'Bench Press',
          date: LocalDate.of(2026, 4, 5),
          sets: [
            { reps: 6, weight: 100, minutesIntoWorkout: 0 },
            { reps: 5, weight: 105, minutesIntoWorkout: 1 },
          ],
        }),
      ],
    });

    const result = calculatePersonalBests(currentSession, [
      previousSession,
      currentSession,
    ]);

    expect(result.previousSessionsCount).toBe(1);
    expect(result.personalBests.map((x) => x.kind)).toEqual([
      'workoutVolume',
      'exerciseVolume',
      'weight',
      'repsAtWeight',
    ] satisfies PersonalBestKind[]);
  });

  it('does not count later sessions when viewing history progress for an older workout', () => {
    const olderSession = createSession({
      id: 'older',
      date: LocalDate.of(2026, 4, 4),
      exercises: [
        createWeightedExercise({
          name: 'Squat',
          date: LocalDate.of(2026, 4, 4),
          sets: [{ reps: 5, weight: 100, minutesIntoWorkout: 0 }],
        }),
      ],
    });
    const viewedSession = createSession({
      id: 'viewed',
      date: LocalDate.of(2026, 4, 5),
      exercises: [
        createWeightedExercise({
          name: 'Squat',
          date: LocalDate.of(2026, 4, 5),
          sets: [{ reps: 5, weight: 110, minutesIntoWorkout: 0 }],
        }),
      ],
    });
    const newerSession = createSession({
      id: 'newer',
      date: LocalDate.of(2026, 4, 6),
      exercises: [
        createWeightedExercise({
          name: 'Squat',
          date: LocalDate.of(2026, 4, 6),
          sets: [{ reps: 5, weight: 140, minutesIntoWorkout: 0 }],
        }),
      ],
    });

    const result = calculatePersonalBests(viewedSession, [
      olderSession,
      viewedSession,
      newerSession,
    ]);

    expect(result.personalBests.some((x) => x.kind === 'weight')).toBe(true);
    expect(
      result.personalBests.some(
        (x) =>
          x.kind === 'weight' &&
          x.previousValue instanceof Weight &&
          x.previousValue.value.toNumber() === 140,
      ),
    ).toBe(false);
  });

  it('returns an empty list when there are no new PBs', () => {
    const previousSession = createSession({
      id: 'previous',
      date: LocalDate.of(2026, 4, 4),
      exercises: [
        createWeightedExercise({
          name: 'Deadlift',
          date: LocalDate.of(2026, 4, 4),
          sets: [{ reps: 5, weight: 150, minutesIntoWorkout: 0 }],
        }),
      ],
    });
    const currentSession = createSession({
      id: 'current',
      date: LocalDate.of(2026, 4, 5),
      exercises: [
        createWeightedExercise({
          name: 'Deadlift',
          date: LocalDate.of(2026, 4, 5),
          sets: [{ reps: 4, weight: 140, minutesIntoWorkout: 0 }],
        }),
      ],
    });

    const result = calculatePersonalBests(currentSession, [
      previousSession,
      currentSession,
    ]);

    expect(result.personalBests).toEqual([]);
  });
});
