import { useMountEffect } from '@/hooks/useMountEffect';
import {
  IncreaseAllEvenlyProgressiveOverload,
  SessionBlueprint,
  WeightedExerciseBlueprint,
} from '@/models/blueprint-models';
import {
  Session,
  RecordedWeightedExercise,
  RecordedSet,
} from '@/models/session-models';
import { Weight } from '@/models/weight';
import { setCurrentSession } from '@/store/current-session';
import { useAppSelector } from '@/store';
import {
  setEditingExerciseIndex,
  setEditingSession,
} from '@/store/session-editor';
import {
  Duration,
  LocalDate,
  LocalTime,
  OffsetDateTime,
  ZoneOffset,
} from '@js-joda/core';
import { Redirect, useLocalSearchParams } from 'expo-router';
import { useDispatch } from 'react-redux';
import BigNumber from 'bignumber.js';
import { setChat, ChatMessage } from '@/store/ai-planner';
import { AiPlan } from '@/models/ai-models';
import { setStatsIsDirty, fetchOverallStats } from '@/store/stats';
import { setSavedPlans } from '@/store/program';
import { ProgramBlueprint } from '@/models/blueprint-models';
import {
  upsertStoredSessions,
  setStoredSessions,
} from '@/store/stored-sessions';
import {
  setColorSchemeSeed,
  setRestNotifications,
  setWelcomeWizardCompleted,
} from '@/store/settings';

export default function ScreenshotCollectionPage() {
  const { type } = useLocalSearchParams<{ type: string }>();
  if (!__DEV__) {
    throw new Error('Cannot collect prod screenshots');
  }
  const dispatch = useDispatch();
  useMountEffect(() => {
    dispatch(setWelcomeWizardCompleted(true));
    dispatch(setColorSchemeSeed('#005500'));
    dispatch(setRestNotifications(false));
  });
  switch (type) {
    case 'workoutpage':
      return <PrepareWorkoutPage />;
    case 'exerciseeditor':
      return <PrepareExerciseEditorPage />;
    case 'ai-planner':
      return <PrepareAiPlannerPage />;
    case 'home':
      return <PrepareHomePage />;
    case 'stats':
      return <PrepareStatsPage />;
    case 'exercise-stats':
      return <PrepareExerciseStatsPage />;
    case 'history':
      return <PrepareHistoryPage />;
  }
}

function PrepareExerciseEditorPage() {
  const activePlanId = useAppSelector((s) => s.program.activePlanId);
  const dispatch = useDispatch();
  useMountEffect(() => {
    dispatch(
      setEditingSession(
        new SessionBlueprint(
          'Push Day',
          [
            WeightedExerciseBlueprint.empty().with({
              name: 'Bench Press',
              sets: 4,
              repsPerSet: 8,
              notes:
                'Keep shoulder blades retracted and drive feet into the floor',
              progressiveOverload: new IncreaseAllEvenlyProgressiveOverload(
                BigNumber(2.5),
              ),
            }),
            WeightedExerciseBlueprint.empty().with({
              name: 'Incline Dumbbell Press',
              sets: 3,
              repsPerSet: 10,
            }),
            WeightedExerciseBlueprint.empty().with({
              name: 'Tricep Pushdown',
              sets: 3,
              repsPerSet: 12,
            }),
          ],
          '',
        ),
      ),
    );
    dispatch(setEditingExerciseIndex(0));
  });

  return (
    <Redirect
      href={`/settings/manage-workouts/${activePlanId}/manage-session/0/exercise`}
    />
  );
}

function PrepareAiPlannerPage() {
  const dispatch = useDispatch();
  useMountEffect(() => {
    const rest = {
      minRest: Duration.ofSeconds(90),
      maxRest: Duration.ofSeconds(180),
      failureRest: Duration.ofSeconds(300),
    };
    const ex = (name: string, sets: number, repsPerSet: number) =>
      new WeightedExerciseBlueprint(
        name,
        sets,
        repsPerSet,
        new IncreaseAllEvenlyProgressiveOverload(BigNumber(2.5)),
        rest,
        false,
        '',
        '',
      );
    dispatch(
      setChat([
        {
          id: 'agent-1',
          from: 'Agent',
          type: 'chatPlan',
          plan: {
            name: 'Upper/Lower Power & Hypertrophy',
            description:
              'A 2-day upper/lower split combining power and hypertrophy training for balanced strength and muscle development.',
            blueprint: new ProgramBlueprint(
              'Upper/Lower Power & Hypertrophy',
              [
                new SessionBlueprint(
                  'Upper Power',
                  [
                    ex('Bench Press', 4, 5),
                    ex('Barbell Row', 4, 5),
                    ex('Overhead Press', 3, 5),
                  ],
                  '',
                ),
                new SessionBlueprint(
                  'Lower Power',
                  [
                    ex('Squat', 4, 5),
                    ex('Romanian Deadlift', 3, 8),
                    ex('Leg Press', 3, 8),
                  ],
                  '',
                ),
              ],
              LocalDate.now(),
            ),
          } satisfies AiPlan,
        } satisfies ChatMessage,
        {
          id: 'user-1',
          from: 'User',
          type: 'messageResponse',
          message: 'Create me a 2-day upper/lower split program',
        } satisfies ChatMessage,
      ]),
    );
  });

  return <Redirect href={'/settings/ai/planner'} />;
}

function buildStatsSessionData(dispatch: ReturnType<typeof useDispatch>) {
  const bw = new Weight(80, 'kilograms');

  const ex = (name: string, sets: number, repsPerSet: number) =>
    WeightedExerciseBlueprint.empty().with({ name, sets, repsPerSet });

  // Session starts ~7-9am with per-day jitter; sets spaced ~3 min apart
  const makeTime = (daysAgo: number, minuteOffset: number) =>
    OffsetDateTime.of(
      LocalDate.now().minusDays(daysAgo),
      LocalTime.of(7 + (daysAgo % 3), (daysAgo * 17) % 30).plusMinutes(
        minuteOffset,
      ),
      ZoneOffset.UTC,
    );

  const completeEx = (
    s: Session,
    exIdx: number,
    weightKg: number,
    sets: number,
    repsPerSet: number,
    daysAgo: number,
    exStartMinute: number,
  ) => {
    const recorded = s.recordedExercises[exIdx] as RecordedWeightedExercise;
    let updated = recorded;
    for (let i = 0; i < sets; i++) {
      const failRoll = (daysAgo * 31 + exIdx * 7 + i * 3) % 9;
      const reps =
        i >= sets - 2 && failRoll < 3
          ? Math.max(repsPerSet - 1 - (failRoll % 2), 1)
          : repsPerSet;
      updated = updated.withSet(i, (ps) =>
        ps.with({
          weight: new Weight(weightKg, 'kilograms'),
          set: new RecordedSet(reps, makeTime(daysAgo, exStartMinute + i * 3)),
        }),
      );
    }
    return s.withExercise(exIdx, updated);
  };

  // Weight increases by `step` every 3 sessions (~1 week of progressive overload)
  const prog = (idx: number, base: number, step: number) =>
    base + Math.floor(idx / 3) * step;

  // Exercises at ~0, 20, 40 min → session runs ~46-55 min
  const push = (daysAgo: number, idx: number) => {
    let s = Session.freeformSession(LocalDate.now().minusDays(daysAgo), bw)
      .withName('Push')
      .withAddedExercise(ex('Bench Press', 4, 8), false)
      .withAddedExercise(ex('Overhead Press', 3, 8), false)
      .withAddedExercise(ex('Tricep Pushdown', 3, 12), false);
    s = completeEx(s, 0, prog(idx, 65, 2.5), 4, 8, daysAgo, 0);
    s = completeEx(s, 1, prog(idx, 45, 1.25), 3, 8, daysAgo, 20);
    s = completeEx(s, 2, prog(idx, 25, 1.25), 3, 12, daysAgo, 40);
    return s;
  };

  const pull = (daysAgo: number, idx: number) => {
    let s = Session.freeformSession(LocalDate.now().minusDays(daysAgo), bw)
      .withName('Pull')
      .withAddedExercise(ex('Barbell Row', 4, 8), false)
      .withAddedExercise(ex('Pull-ups', 3, 8), false)
      .withAddedExercise(ex('Bicep Curl', 3, 12), false);
    s = completeEx(s, 0, prog(idx, 60, 2.5), 4, 8, daysAgo, 0);
    s = completeEx(s, 1, 0, 3, 8, daysAgo, 20);
    s = completeEx(s, 2, prog(idx, 12.5, 1.25), 3, 12, daysAgo, 40);
    return s;
  };

  const legs = (daysAgo: number, idx: number) => {
    let s = Session.freeformSession(LocalDate.now().minusDays(daysAgo), bw)
      .withName('Legs')
      .withAddedExercise(ex('Squat', 4, 5), false)
      .withAddedExercise(ex('Romanian Deadlift', 3, 8), false)
      .withAddedExercise(ex('Leg Press', 3, 10), false);
    s = completeEx(s, 0, prog(idx, 80, 2.5), 4, 5, daysAgo, 0);
    s = completeEx(s, 1, prog(idx, 70, 2.5), 3, 8, daysAgo, 20);
    s = completeEx(s, 2, prog(idx, 100, 5), 3, 10, daysAgo, 40);
    return s;
  };

  // 39 sessions over 90 days (~3/week), push/pull/legs rotating
  const daysAgoList = [
    89, 87, 84, 82, 80, 77, 75, 73, 70, 68, 65, 63, 61, 58, 56, 54, 51, 49, 47,
    44, 42, 40, 37, 35, 33, 30, 28, 26, 23, 21, 19, 16, 14, 12, 9, 7, 5, 3, 1,
  ];
  const sessions = daysAgoList.map((daysAgo, i) => {
    if (i % 3 === 0) return push(daysAgo, i);
    if (i % 3 === 1) return pull(daysAgo, i);
    return legs(daysAgo, i);
  });

  dispatch(setStoredSessions({}));
  dispatch(upsertStoredSessions(sessions));
  dispatch(setStatsIsDirty(true));
  dispatch(fetchOverallStats());
}

function PrepareHistoryPage() {
  const dispatch = useDispatch();
  useMountEffect(() => buildStatsSessionData(dispatch));
  return <Redirect href={'/history'} />;
}

function PrepareStatsPage() {
  const dispatch = useDispatch();
  useMountEffect(() => buildStatsSessionData(dispatch));
  return <Redirect href={'/stats'} />;
}

function PrepareExerciseStatsPage() {
  const dispatch = useDispatch();
  useMountEffect(() => buildStatsSessionData(dispatch));
  return (
    <Redirect
      href={'/stats/expanded-weighted-exercise?exerciseName=Bench%20Press'}
    />
  );
}

function PrepareHomePage() {
  const activePlanId = useAppSelector((s) => s.program.activePlanId);
  const dispatch = useDispatch();
  useMountEffect(() => {
    dispatch(
      setCurrentSession({ target: 'workoutSession', session: undefined }),
    );
    dispatch(
      setSavedPlans({
        [activePlanId]: new ProgramBlueprint(
          'Upper/Lower Split',
          [
            new SessionBlueprint(
              'Upper Power',
              [
                WeightedExerciseBlueprint.empty().with({
                  name: 'Bench Press',
                  sets: 4,
                  repsPerSet: 5,
                }),
                WeightedExerciseBlueprint.empty().with({
                  name: 'Barbell Row',
                  sets: 4,
                  repsPerSet: 5,
                }),
                WeightedExerciseBlueprint.empty().with({
                  name: 'Overhead Press',
                  sets: 3,
                  repsPerSet: 5,
                }),
              ],
              '',
            ),
            new SessionBlueprint(
              'Lower Power',
              [
                WeightedExerciseBlueprint.empty().with({
                  name: 'Squat',
                  sets: 4,
                  repsPerSet: 5,
                }),
                WeightedExerciseBlueprint.empty().with({
                  name: 'Romanian Deadlift',
                  sets: 3,
                  repsPerSet: 8,
                }),
                WeightedExerciseBlueprint.empty().with({
                  name: 'Leg Press',
                  sets: 3,
                  repsPerSet: 8,
                }),
              ],
              '',
            ),
            new SessionBlueprint(
              'Upper Hypertrophy',
              [
                WeightedExerciseBlueprint.empty().with({
                  name: 'Incline Dumbbell Press',
                  sets: 3,
                  repsPerSet: 10,
                }),
                WeightedExerciseBlueprint.empty().with({
                  name: 'Cable Row',
                  sets: 3,
                  repsPerSet: 12,
                }),
                WeightedExerciseBlueprint.empty().with({
                  name: 'Lateral Raises',
                  sets: 3,
                  repsPerSet: 15,
                }),
              ],
              '',
            ),
            new SessionBlueprint(
              'Lower Hypertrophy',
              [
                WeightedExerciseBlueprint.empty().with({
                  name: 'Leg Press',
                  sets: 4,
                  repsPerSet: 12,
                }),
                WeightedExerciseBlueprint.empty().with({
                  name: 'Leg Curl',
                  sets: 3,
                  repsPerSet: 12,
                }),
                WeightedExerciseBlueprint.empty().with({
                  name: 'Calf Raises',
                  sets: 4,
                  repsPerSet: 15,
                }),
              ],
              '',
            ),
          ],
          LocalDate.now(),
        ),
      }),
    );
  });

  return <Redirect href={'/(session)'} />;
}

function setExerciseWeight(
  s: Session,
  exIdx: number,
  weightKg: number,
): Session {
  const recorded = s.recordedExercises[exIdx] as RecordedWeightedExercise;
  return s.withExercise(
    exIdx,
    recorded.withWeight(0, new Weight(weightKg, 'kilograms'), 'allSets'),
  );
}

function PrepareWorkoutPage() {
  const dispatch = useDispatch();
  useMountEffect(() => {
    let session = Session.freeformSession(
      LocalDate.now(),
      new Weight(80, 'kilograms'),
    ).withAddedExercise(
      WeightedExerciseBlueprint.empty().with({
        name: 'Squats',
        repsPerSet: 10,
        sets: 3,
      }),
      false,
    );
    session = setExerciseWeight(session, 0, 100);
    session = session
      .withCycledExerciseReps(0, 0, OffsetDateTime.now())
      .with({ restTimerStartTime: OffsetDateTime.now().minusSeconds(45) })
      .withAddedExercise(
        WeightedExerciseBlueprint.empty().with({
          name: 'Bench Press',
          repsPerSet: 12,
          sets: 3,
        }),
        false,
      );
    session = setExerciseWeight(session, 1, 80);
    session = session.withAddedExercise(
      WeightedExerciseBlueprint.empty().with({
        name: 'Deadlift',
        repsPerSet: 6,
        sets: 2,
      }),
      false,
    );
    session = setExerciseWeight(session, 2, 120);
    dispatch(setCurrentSession({ target: 'workoutSession', session }));
  });

  return <Redirect href={'/(session)/session'} />;
}
