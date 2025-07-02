import {
  endIncreasingHoldHaptics,
  initializeAppStateSlice,
  refreshNotificationPermissionStatus,
  requestExactNotificationPermission,
  setCanScheduleExactNotifications,
  setCurrentSnackbar,
  setIsHydrated,
  shareString,
  showSnackbar,
  startIncreasingHoldHaptics,
} from '@/store/app';
import { addEffect } from '@/store/listenerMiddleware';
import { sleep } from '@/utils/sleep';
import * as Haptics from 'expo-haptics';

export function applyAppEffects() {
  addEffect(
    initializeAppStateSlice,
    async (
      _,
      { cancelActiveListeners, dispatch, extra: { notificationService } },
    ) => {
      cancelActiveListeners();

      const canScheduleExactAlarm =
        await notificationService.canScheduleExactNotifications();
      dispatch(setCanScheduleExactNotifications(canScheduleExactAlarm));

      dispatch(setIsHydrated(true));
    },
  );

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
