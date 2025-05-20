import {
  createAction,
  createSlice,
  PayloadAction,
  UnknownAction,
} from '@reduxjs/toolkit';

const initialState: AppState = {
  isHydrated: false,
  canScheduleExactNotifications: false,
  currentSnackbar: undefined,
};

export type AppState = {
  isHydrated: boolean;
  canScheduleExactNotifications: boolean;
  currentSnackbar: SnackbarDescriptor | undefined;
};

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

    setCurrentSnackbar(
      state,
      action: PayloadAction<SnackbarDescriptor | undefined>,
    ) {
      state.currentSnackbar = action.payload;
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

export type SnackbarDescriptor =
  | {
      text: string;
      action?: undefined;
      dispatchAction?: undefined;
    }
  | {
      text: string;
      action: string;
      dispatchAction: UnknownAction;
    };
export const showSnackbar = createAction<
  SnackbarDescriptor & { duration?: number }
>('snackBarWithAction');

export const {
  setIsHydrated,
  setCanScheduleExactNotifications,
  setCurrentSnackbar,
} = appSlice.actions;

export default appSlice.reducer;
