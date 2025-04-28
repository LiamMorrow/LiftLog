import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState = {
  isHydrated: false,
  canScheduleExactNotifications: false,
};

export type AppState = typeof initialState;

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setIsHydrated(state, action: PayloadAction<boolean>) {
      state.isHydrated = action.payload;
    },

    setCanScheduleExactNotifications(state, action: PayloadAction<boolean>) {
      state.canScheduleExactNotifications = action.payload;
    },
  },
});

export const requestExactNotificationPermission = createAction(
  'requestExactNotificationPermission',
);

export const refreshNotificationPermissionStatus = createAction(
  'refreshNotificationPermissionStatus',
);

export const initializeAppStateSlice = createAction('initializeAppStateSlice');

export const { setIsHydrated, setCanScheduleExactNotifications } =
  appSlice.actions;

export default appSlice.reducer;
