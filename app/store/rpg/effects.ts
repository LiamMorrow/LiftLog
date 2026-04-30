import { addDebouncedEffect, addEffect } from '@/store/store';
import {
  awardXp,
  hydrateRpgState,
  initializeRpgStateSlice,
  levelFromXp,
  Quest,
  recordWorkout,
  RpgState,
  setWeeklyQuests,
  unlockAchievement,
  updateQuestProgress,
} from './index';
import { addStoredSession } from '@/store/stored-sessions';
import { selectSessions } from '@/store/stored-sessions';
import {
  RecordedCardioExercise,
  RecordedWeightedExercise,
  Session,
} from '@/models/session-models';

const RPG_KEY = 'RpgState';

function isoWeekKey(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00Z`);
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(
    ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
  );
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

function currentWeekKey(): string {
  return isoWeekKey(new Date().toISOString().slice(0, 10));
}

function sessionXp(session: Session): number {
  let xp = 50;
  for (const ex of session.recordedExercises) {
    if (ex instanceof RecordedWeightedExercise) {
      for (const ps of ex.potentialSets) {
        if (ps.set !== undefined) xp += 10;
      }
    } else if (ex instanceof RecordedCardioExercise) {
      if (ex.completionDateTime !== undefined) xp += 15;
    }
  }
  return xp;
}

function completedSetsInSession(session: Session): number {
  let count = 0;
  for (const ex of session.recordedExercises) {
    if (ex instanceof RecordedWeightedExercise) {
      for (const ps of ex.potentialSets) {
        if (ps.set !== undefined) count++;
      }
    }
  }
  return count;
}

function computeNewStreak(rpg: RpgState, today: string): number {
  if (!rpg.lastWorkoutDate) return 1;
  const last = new Date(rpg.lastWorkoutDate);
  const todayDate = new Date(`${today}T00:00:00Z`);
  const diffDays = Math.round(
    (todayDate.getTime() - last.getTime()) / 86400000,
  );
  if (diffDays === 0) return rpg.streakDays;
  if (diffDays === 1) return rpg.streakDays + 1;
  return 1;
}

function buildWeeklyQuests(weekKey: string, level: number): Quest[] {
  const workoutTarget = level >= 10 ? 4 : level >= 5 ? 3 : 2;
  const setsTarget = level >= 10 ? 60 : level >= 5 ? 40 : 20;
  const streakTarget = level >= 10 ? 4 : level >= 5 ? 3 : 2;
  return [
    {
      id: `${weekKey}-workouts`,
      title: 'Missões da Semana',
      description: `Complete ${workoutTarget} treinos esta semana`,
      target: workoutTarget,
      progress: 0,
      xpReward: workoutTarget * 50,
      type: 'workouts_this_week',
      weekKey,
    },
    {
      id: `${weekKey}-sets`,
      title: 'Volume de Ferro',
      description: `Complete ${setsTarget} séries esta semana`,
      target: setsTarget,
      progress: 0,
      xpReward: 150,
      type: 'total_sets_this_week',
      weekKey,
    },
    {
      id: `${weekKey}-streak`,
      title: 'Combo de Batalhas',
      description: `Treine ${streakTarget} dias seguidos`,
      target: streakTarget,
      progress: 0,
      xpReward: 200,
      type: 'streak_days',
      weekKey,
    },
  ];
}

function serializeRpg(state: RpgState): Omit<RpgState, 'isHydrated'> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { isHydrated: _, ...rest } = state;
  return rest;
}

export function applyRpgEffects() {
  addEffect(
    initializeRpgStateSlice,
    async (_, { dispatch, getState, extra: { keyValueStore } }) => {
      const raw = await keyValueStore.getItem(RPG_KEY);
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as Partial<
            Omit<RpgState, 'isHydrated'>
          >;
          dispatch(hydrateRpgState(parsed));
        } catch {
          dispatch(hydrateRpgState({}));
        }
      } else {
        dispatch(hydrateRpgState({}));
      }

      const weekKey = currentWeekKey();
      const hasCurrentWeekQuests = getState().rpg.weeklyQuests.some(
        (q) => q.weekKey === weekKey,
      );
      if (!hasCurrentWeekQuests) {
        const level = levelFromXp(getState().rpg.xp);
        dispatch(setWeeklyQuests(buildWeeklyQuests(weekKey, level)));
      }
    },
  );

  addEffect(
    addStoredSession,
    async (
      _,
      {
        dispatch,
        getState,
        stateAfterReduce,
        originalState,
        extra: { keyValueStore },
      },
    ) => {
      const prevIds = new Set(
        selectSessions(originalState).map((s) => s.id),
      );
      const newSession = selectSessions(stateAfterReduce).find(
        (s) => !prevIds.has(s.id),
      );
      if (!newSession) return;

      const rpg = stateAfterReduce.rpg;
      const today = newSession.date.toString();
      const xpGained = sessionXp(newSession);
      const dateIso = new Date().toISOString();

      const totalWorkoutsAfter = rpg.totalWorkouts + 1;
      const levelAfter = levelFromXp(rpg.xp + xpGained);
      const streakAfter = computeNewStreak(rpg, today);

      const newAchievementIds: string[] = [];
      const toUnlock: string[] = [];

      const check = (id: string, cond: boolean) => {
        if (cond && !rpg.achievements[id]) {
          toUnlock.push(id);
          newAchievementIds.push(id);
        }
      };

      check('first_quest', totalWorkoutsAfter >= 1);
      check('ten_workouts', totalWorkoutsAfter >= 10);
      check('fifty_workouts', totalWorkoutsAfter >= 50);
      check('hundred_workouts', totalWorkoutsAfter >= 100);
      check('five_streak', streakAfter >= 5);
      check('level_5', levelAfter >= 5);
      check('level_10', levelAfter >= 10);
      check(
        'consistency',
        selectSessions(stateAfterReduce).filter(
          (s) => isoWeekKey(s.date.toString()) === currentWeekKey(),
        ).length >= 3,
      );
      check(
        'heavy_lift',
        newSession.recordedExercises.some(
          (ex) =>
            ex instanceof RecordedWeightedExercise &&
            ex.potentialSets.some(
              (ps) =>
                ps.set !== undefined && ps.weight.value.toNumber() >= 100,
            ),
        ),
      );

      dispatch(awardXp(xpGained));
      dispatch(recordWorkout({ date: today, xpGained, newAchievementIds }));
      for (const id of toUnlock) {
        dispatch(unlockAchievement({ id, date: dateIso }));
      }

      const weekKey = currentWeekKey();
      const allSessionsAfter = selectSessions(getState());
      const weekSessions = allSessionsAfter.filter(
        (s) => isoWeekKey(s.date.toString()) === weekKey,
      );
      const workoutsThisWeek = weekSessions.length;
      const setsThisWeek = weekSessions.reduce(
        (sum, s) => sum + completedSetsInSession(s),
        0,
      );

      const quests = getState().rpg.weeklyQuests;
      for (const quest of quests) {
        if (quest.weekKey !== weekKey) continue;
        let progress = 0;
        if (quest.type === 'workouts_this_week') {
          progress = workoutsThisWeek;
        } else if (quest.type === 'total_sets_this_week') {
          progress = setsThisWeek;
        } else if (quest.type === 'streak_days') {
          progress = getState().rpg.streakDays;
        }
        const completedAt =
          progress >= quest.target && !quest.completedAt
            ? dateIso
            : undefined;
        dispatch(
          updateQuestProgress({ questId: quest.id, progress, completedAt }),
        );
      }

      await keyValueStore.setItem(
        RPG_KEY,
        JSON.stringify(serializeRpg(getState().rpg)),
      );
    },
  );

  addDebouncedEffect(
    [awardXp, recordWorkout, unlockAchievement, setWeeklyQuests, updateQuestProgress],
    async (_, { getState, extra: { keyValueStore } }) => {
      if (!getState().rpg.isHydrated) return;
      await keyValueStore.setItem(
        RPG_KEY,
        JSON.stringify(serializeRpg(getState().rpg)),
      );
    },
    2000,
  );
}
