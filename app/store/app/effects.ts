import {
  endIncreasingHoldHaptics,
  initializeAppStateSlice,
  initializeBuiltInExerciseList,
  refreshNotificationPermissionStatus,
  requestExactNotificationPermission,
  setCanScheduleExactNotifications,
  setCurrentSnackbar,
  setIsHydrated,
  shareString,
  showSnackbar,
  startIncreasingHoldHaptics,
} from '@/store/app';
import { addEffect } from '@/store/store';
import { sleep } from '@/utils/sleep';
import { migrate } from 'drizzle-orm/expo-sqlite/migrator';
import * as Haptics from 'expo-haptics';
import migrations from '../../drizzle/migrations';
import { initializeAiPlannerStateSlice } from '@/store/ai-planner';
import { initializeCurrentSessionStateSlice } from '@/store/current-session';
import { initializeFeedStateSlice } from '@/store/feed';
import { initializeProgramStateSlice } from '@/store/program';
import { initializeSettingsStateSlice } from '@/store/settings';
import { initializeStoredSessionsStateSlice } from '@/store/stored-sessions';
import { exerciseTable, migrationVersionsTable } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import builtInExerciseListJson from '../../assets/exercises.json';

export function applyAppEffects() {
  addEffect(
    initializeAppStateSlice,
    async (_, { dispatch, extra: { notificationService, db } }) => {
      // Ensure this runs first
      await migrate(db, migrations);

      const canScheduleExactAlarm =
        await notificationService.canScheduleExactNotifications();
      dispatch(setCanScheduleExactNotifications(canScheduleExactAlarm));

      dispatch(initializeBuiltInExerciseList());
      dispatch(initializeSettingsStateSlice());
      dispatch(initializeCurrentSessionStateSlice());
      dispatch(initializeProgramStateSlice());
      dispatch(initializeStoredSessionsStateSlice());
      dispatch(initializeFeedStateSlice());
      dispatch(initializeAiPlannerStateSlice());

      dispatch(setIsHydrated(true));
    },
    { cancelActiveListeners: true },
  );

  addEffect(initializeBuiltInExerciseList, async (_, { extra: { db } }) => {
    const migrationVersion = (
      await db.select().from(migrationVersionsTable)
    ).at(0);
    // if (migrationVersion?.builtInExerciseListVersion === 1) {
    //   return;
    // }

    await db.delete(exerciseTable).where(eq(exerciseTable.isBuiltIn, true));
    const insertValues: (typeof exerciseTable.$inferInsert)[] =
      builtInExerciseListJson.exercises.map((ex) => ({
        category: ex.category,
        equipment: ex.equipment ?? '',
        instructions: ex.instructions,
        isBuiltIn: true,
        level: ex.level,
        name: ex.name,
        primaryMuscles: ex.primaryMuscles,
        secondaryMuscles: ex.secondaryMuscles,
        force: ex.force,
        mechanic: ex.mechanic,
      }));
    for (const exercise of insertValues) {
      await db.insert(exerciseTable).values(exercise);
    }
    if (!migrationVersion) {
      await db
        .insert(migrationVersionsTable)
        .values({ builtInExerciseListVersion: 1 });
    } else {
      await db
        .update(migrationVersionsTable)
        .set({ builtInExerciseListVersion: 1 });
    }

    console.log(await db.select().from(exerciseTable).limit(1));

    // Test FTS search functionality
    const exerciseSearch = db.all(
      sql`SELECT * FROM exercise_fts
          WHERE exercise_fts MATCH 'crunch'`,
    );
    console.log('FTS search working! Found exercises:', exerciseSearch);
  });

  addEffect(
    refreshNotificationPermissionStatus,
    async (_, { dispatch, extra: { notificationService } }) => {
      const result = await notificationService.canScheduleExactNotifications();
      dispatch(setCanScheduleExactNotifications(result));
    },
  );

  addEffect(
    requestExactNotificationPermission,
    async (_, { dispatch, extra: { notificationService } }) => {
      const result =
        await notificationService.requestScheduleExactNotificationPermission();
      dispatch(setCanScheduleExactNotifications(result));
    },
  );

  addEffect(showSnackbar, async (action, { dispatch, getState }) => {
    dispatch(setCurrentSnackbar(action.payload));
    await sleep(action.payload.duration ?? 5000);
    if (getState().app.currentSnackbar === action.payload) {
      dispatch(setCurrentSnackbar(undefined));
    }
  });

  addEffect(shareString, async (action, { extra: { stringSharer } }) => {
    await stringSharer.share(action.payload.value, action.payload.title);
  });

  addEffect(startIncreasingHoldHaptics, (_, {}) => {
    // TODO increasing amplitude of vibration until completed long press
  });
  addEffect(
    endIncreasingHoldHaptics,
    async ({ payload: { completedHold } }, {}) => {
      if (completedHold) {
        await Haptics.selectionAsync();
      }
    },
  );
}
