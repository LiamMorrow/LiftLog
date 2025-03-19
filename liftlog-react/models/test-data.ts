import { Rest, SessionBlueprint } from '@/models/blueprint-models';
import { RecordedExercise, Session } from '@/models/session-models';
import { LocalDate } from '@js-joda/core';
import BigNumber from 'bignumber.js';
import Enumerable from 'linq';

export const benchPress: RecordedExercise = {
  blueprint: {
    name: 'Bench Press',
    sets: 3,
    repsPerSet: 10,
    supersetWithNext: false,
    link: '',
    notes: '',
    restBetweenSets: Rest.medium,
    weightIncreaseOnSuccess: new BigNumber('2.5'),
  },
  potentialSets: Enumerable.range(0, 3)
    .select(() => ({
      weight: new BigNumber(100),
      set: undefined,
    }))
    .toArray(),
  notes: '',
  perSetWeight: false,
};

export const squats: RecordedExercise = {
  blueprint: {
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
    .select(() => ({
      weight: new BigNumber(150),
      set: undefined,
    }))
    .toArray(),
  notes: '',
  perSetWeight: false,
};

export const overheadPress: RecordedExercise = {
  blueprint: {
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
    .select(() => ({
      weight: new BigNumber(75),
      set: undefined,
    }))
    .toArray(),
  notes: '',
  perSetWeight: false,
};

export const defaultSessionBlueprint: SessionBlueprint = {
  exercises: [squats.blueprint, benchPress.blueprint, overheadPress.blueprint],
  notes: 'Notes on my session',
  name: 'My Session',
};

export const defaultSession: Session = {
  blueprint: defaultSessionBlueprint,
  id: Math.random().toString(),
  recordedExercises: [squats, benchPress, overheadPress],
  date: LocalDate.now(),
  bodyweight: new BigNumber(0),
};
