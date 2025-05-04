import { addEffect } from '@/store/listenerMiddleware';
import { initializeSettingsStateSlice, setIsHydrated } from '@/store/settings';

export function applySettingsEffects() {
  addEffect(
    initializeSettingsStateSlice,
    async (_, { cancelActiveListeners, dispatch, extra: {} }) => {
      cancelActiveListeners();
      // TODO see SettingsStateInitMiddleware - should load all programs from disk
      dispatch(setIsHydrated(true));
    },
  );
  // TODO we might need a generic handler which sets settings values from dispatched actions
}
