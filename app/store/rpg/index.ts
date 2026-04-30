import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/store/store';

export function xpForLevel(level: number): number {
  return Math.pow(level - 1, 2) * 100;
}

export function levelFromXp(xp: number): number {
  return Math.max(1, Math.floor(1 + Math.sqrt(xp / 100)));
}

const TITLES: [number, string][] = [
  [20, 'Lenda da Academia'],
  [15, 'Mestre das Placas'],
  [10, 'Cavaleiro do Ferro'],
  [6, 'Espadachim da Academia'],
  [3, 'Guerreiro Novato'],
  [1, 'Iniciante'],
];

export function titleForLevel(level: number): string {
  return TITLES.find(([min]) => level >= min)?.[1] ?? 'Iniciante';
}

export function xpProgress(xp: number): { current: number; needed: number } {
  const level = levelFromXp(xp);
  const cur = xpForLevel(level);
  const next = xpForLevel(level + 1);
  return { current: xp - cur, needed: next - cur };
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_quest', name: 'Primeira Missão', description: 'Complete seu primeiro treino', icon: 'star' },
  { id: 'consistency', name: 'Consistência', description: '3 treinos em uma semana', icon: 'localFireDepartment' },
  { id: 'five_streak', name: 'Semana Perfeita', description: 'Treine 5 dias seguidos', icon: 'bolt' },
  { id: 'ten_workouts', name: 'Veterano', description: 'Complete 10 treinos', icon: 'militaryTech' },
  { id: 'fifty_workouts', name: 'Guerreiro', description: 'Complete 50 treinos', icon: 'shield' },
  { id: 'hundred_workouts', name: 'Centurião', description: '100 treinos completos', icon: 'workspacePremium' },
  { id: 'heavy_lift', name: 'Força Bruta', description: 'Levante 100 em uma série', icon: 'fitnessCenter' },
  { id: 'level_5', name: 'Em Ascensão', description: 'Alcance o nível 5', icon: 'trendingUp' },
  { id: 'level_10', name: 'Veterano de Ferro', description: 'Alcance o nível 10', icon: 'diamond' },
];

export interface Quest {
  id: string;
  title: string;
  description: string;
  target: number;
  progress: number;
  xpReward: number;
  type: 'workouts_this_week' | 'total_sets_this_week' | 'streak_days';
  weekKey: string;
  completedAt?: string;
}

export interface RpgState {
  xp: number;
  totalWorkouts: number;
  streakDays: number;
  lastWorkoutDate?: string;
  achievements: Record<string, string>;
  pendingLevelUp: boolean;
  levelUpNewLevel?: number;
  weeklyQuests: Quest[];
  isHydrated: boolean;
  lastSessionReward?: { xpGained: number; newAchievementIds: string[] };
}

const initialState: RpgState = {
  xp: 0,
  totalWorkouts: 0,
  streakDays: 0,
  lastWorkoutDate: undefined,
  achievements: {},
  pendingLevelUp: false,
  levelUpNewLevel: undefined,
  weeklyQuests: [],
  isHydrated: false,
  lastSessionReward: undefined,
};

const rpgSlice = createSlice({
  name: 'rpg',
  initialState,
  reducers: {
    hydrateRpgState(_, action: PayloadAction<Partial<Omit<RpgState, 'isHydrated'>>>) {
      return { ...initialState, ...action.payload, isHydrated: true };
    },
    awardXp(state, action: PayloadAction<number>) {
      const prevLevel = levelFromXp(state.xp);
      state.xp += action.payload;
      const newLevel = levelFromXp(state.xp);
      if (newLevel > prevLevel) {
        state.pendingLevelUp = true;
        state.levelUpNewLevel = newLevel;
      }
    },
    clearLevelUp(state) {
      state.pendingLevelUp = false;
      state.levelUpNewLevel = undefined;
    },
    recordWorkout(
      state,
      action: PayloadAction<{ date: string; xpGained: number; newAchievementIds: string[] }>,
    ) {
      state.totalWorkouts += 1;
      state.lastSessionReward = {
        xpGained: action.payload.xpGained,
        newAchievementIds: action.payload.newAchievementIds,
      };
      if (state.lastWorkoutDate) {
        const last = new Date(state.lastWorkoutDate);
        const today = new Date(action.payload.date);
        const diffDays = Math.round(
          (today.getTime() - last.getTime()) / 86400000,
        );
        if (diffDays === 1) {
          state.streakDays += 1;
        } else if (diffDays > 1) {
          state.streakDays = 1;
        }
      } else {
        state.streakDays = 1;
      }
      state.lastWorkoutDate = action.payload.date;
    },
    unlockAchievement(state, action: PayloadAction<{ id: string; date: string }>) {
      if (!state.achievements[action.payload.id]) {
        state.achievements[action.payload.id] = action.payload.date;
      }
    },
    setWeeklyQuests(state, action: PayloadAction<Quest[]>) {
      state.weeklyQuests = action.payload;
    },
    updateQuestProgress(
      state,
      action: PayloadAction<{ questId: string; progress: number; completedAt?: string }>,
    ) {
      const quest = state.weeklyQuests.find((q) => q.id === action.payload.questId);
      if (quest) {
        quest.progress = Math.min(action.payload.progress, quest.target);
        if (action.payload.completedAt && !quest.completedAt) {
          quest.completedAt = action.payload.completedAt;
        }
      }
    },
    clearSessionReward(state) {
      state.lastSessionReward = undefined;
    },
    initializeRpgStateSlice() {},
  },
});

export const {
  hydrateRpgState,
  awardXp,
  clearLevelUp,
  recordWorkout,
  unlockAchievement,
  setWeeklyQuests,
  updateQuestProgress,
  clearSessionReward,
  initializeRpgStateSlice,
} = rpgSlice.actions;

export const rpgReducer = rpgSlice.reducer;

export const selectRpgLevel = (state: RootState) => levelFromXp(state.rpg.xp);
export const selectRpgTitle = (state: RootState) =>
  titleForLevel(levelFromXp(state.rpg.xp));
export const selectXpProgress = (state: RootState) => xpProgress(state.rpg.xp);
export const selectAllAchievements = (state: RootState) =>
  ACHIEVEMENTS.map((def) => ({
    ...def,
    unlockedAt: state.rpg.achievements[def.id],
  }));
export const selectActiveQuests = (state: RootState) => state.rpg.weeklyQuests;
