import { Rest, SessionBlueprint } from '@/models/blueprint-models';
import { Weight } from '@/models/weight';
import {
  PotentialSetPOJO,
  RecordedWeightedExercise,
  Session,
} from '@/models/session-models';
import { LocalDate } from '@js-joda/core';
import BigNumber from 'bignumber.js';
import Enumerable from 'linq';

export const benchPress: RecordedWeightedExercise =
  RecordedWeightedExercise.fromPOJO({
    blueprint: {
      type: 'WeightedExerciseBlueprint',
      name: 'Bench Press',
      sets: 3,
      repsPerSet: 10,
      supersetWithNext: true,
      link: '',
      notes: '',
      restBetweenSets: Rest.medium,
      weightIncreaseOnSuccess: new BigNumber('2.5'),
    },
    potentialSets: Enumerable.range(0, 10)
      .select(
        () =>
          ({
            type: 'PotentialSet',
            weight: new Weight(100, 'kilograms'),
            set: undefined,
          }) satisfies PotentialSetPOJO,
      )
      .toArray(),
    notes: '',
  });

export const squats: RecordedWeightedExercise =
  RecordedWeightedExercise.fromPOJO({
    blueprint: {
      type: 'WeightedExerciseBlueprint',
      name: 'Squats',
      sets: 3,
      repsPerSet: 10,
      supersetWithNext: true,
      link: '',
      notes: '',
      restBetweenSets: Rest.medium,
      weightIncreaseOnSuccess: new BigNumber('5'),
    },
    potentialSets: Enumerable.range(0, 3)
      .select(
        () =>
          ({
            type: 'PotentialSet',
            weight: new Weight(150, 'kilograms'),
            set: undefined,
          }) as const,
      )
      .toArray(),
    notes: '',
  });

export const overheadPress: RecordedWeightedExercise =
  RecordedWeightedExercise.fromPOJO({
    blueprint: {
      type: 'WeightedExerciseBlueprint',
      name: 'Overhead Press',
      sets: 3,
      repsPerSet: 10,
      supersetWithNext: true,
      link: '',
      notes: '',
      restBetweenSets: Rest.medium,
      weightIncreaseOnSuccess: new BigNumber('2.5'),
    },
    potentialSets: Enumerable.range(0, 3)
      .select(
        () =>
          ({
            type: 'PotentialSet',
            weight: new Weight(75, 'kilograms'),
            set: undefined,
          }) as const,
      )
      .toArray(),
    notes: '',
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
    name: 'Workout A',
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
  bodyweight: new Weight(0, 'kilograms'),
});
