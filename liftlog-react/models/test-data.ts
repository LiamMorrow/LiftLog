import { Rest, SessionBlueprint } from '@/models/blueprint-models';
import {
  PotentialSetPOJO,
  RecordedExercise,
  Session,
} from '@/models/session-models';
import { LocalDate } from '@js-joda/core';
import BigNumber from 'bignumber.js';
import Enumerable from 'linq';

export const benchPress: RecordedExercise = RecordedExercise.fromPOJO({
  blueprint: {
    _BRAND: 'EXERCISE_BLUEPRINT_POJO',
    name: 'Bench Press',
    sets: 3,
    repsPerSet: 10,
    supersetWithNext: false,
    link: '',
    notes: '',
    restBetweenSets: Rest.medium,
    weightIncreaseOnSuccess: new BigNumber('2.5'),
  },
  potentialSets: Enumerable.range(0, 10)
    .select(
      () =>
        ({
          _BRAND: 'POTENTIAL_SET_POJO',
          weight: new BigNumber(100),
          set: undefined,
        }) satisfies PotentialSetPOJO,
    )
    .toArray(),
  notes: '',
  perSetWeight: false,
});

export const squats: RecordedExercise = RecordedExercise.fromPOJO({
  blueprint: {
    _BRAND: 'EXERCISE_BLUEPRINT_POJO',
    name: 'Squats',
    sets: 3,
    repsPerSet: 10,
    supersetWithNext: false,
    link: '',
    notes: '',
    restBetweenSets: Rest.medium,
    weightIncreaseOnSuccess: new BigNumber('5'),
  },
  potentialSets: Enumerable.range(0, 3)
    .select(
      () =>
        ({
          _BRAND: 'POTENTIAL_SET_POJO',
          weight: new BigNumber(150),
          set: undefined,
        }) as const,
    )
    .toArray(),
  notes: '',
  perSetWeight: false,
});

export const overheadPress: RecordedExercise = RecordedExercise.fromPOJO({
  blueprint: {
    _BRAND: 'EXERCISE_BLUEPRINT_POJO',
    name: 'Overhead Press',
    sets: 3,
    repsPerSet: 10,
    supersetWithNext: false,
    link: '',
    notes: '',
    restBetweenSets: Rest.medium,
    weightIncreaseOnSuccess: new BigNumber('2.5'),
  },
  potentialSets: Enumerable.range(0, 3)
    .select(
      () =>
        ({
          _BRAND: 'POTENTIAL_SET_POJO',
          weight: new BigNumber(75),
          set: undefined,
        }) as const,
    )
    .toArray(),
  notes: '',
  perSetWeight: false,
});

export const defaultSessionBlueprint: SessionBlueprint =
  SessionBlueprint.fromPOJO({
    exercises: [
      squats.blueprint.toPOJO(),
      benchPress.blueprint.toPOJO(),
      overheadPress.blueprint.toPOJO(),
      overheadPress.blueprint.toPOJO(),
    ],
    notes: 'Notes on my session',
    name: 'My Session',
  });

export const defaultSession: Session = Session.fromPOJO({
  blueprint: defaultSessionBlueprint.toPOJO(),
  id: Math.random().toString(),
  recordedExercises: [
    squats.toPOJO(),
    benchPress.toPOJO(),
    overheadPress.toPOJO(),
    overheadPress.toPOJO(),
  ],
  date: LocalDate.now(),
  bodyweight: new BigNumber(0),
});
