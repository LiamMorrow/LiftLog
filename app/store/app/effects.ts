import {
  initializeAppStateSlice,
  setCurrentSnackbar,
  setIsHydrated,
  shareString,
  showSnackbar,
} from '@/store/app';
import { addEffect } from '@/store/store';
import { sleep } from '@/utils/sleep';

export function applyAppEffects() {
  addEffect(
    initializeAppStateSlice,
    async (_, { cancelActiveListeners, dispatch }) => {
      cancelActiveListeners();

      dispatch(setIsHydrated(true));
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
}
