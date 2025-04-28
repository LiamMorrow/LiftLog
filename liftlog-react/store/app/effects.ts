import {
  initializeAppStateSlice,
  refreshNotificationPermissionStatus,
  requestExactNotificationPermission,
  setCanScheduleExactNotifications,
  setIsHydrated,
} from '@/store/app';
import { addEffect } from '@/store/listenerMiddleware';

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
}
