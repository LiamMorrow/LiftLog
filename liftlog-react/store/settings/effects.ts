import { addEffect } from '@/store/listenerMiddleware';
import { initializeSettingsStateSlice, setIsHydrated } from '@/store/settings';
import { addExportBackupEffects } from '@/store/settings/export-backup-effects';
import { addExportPlaintextEffects } from '@/store/settings/export-plaintext-effects';

export function applySettingsEffects() {
  addEffect(
    initializeSettingsStateSlice,
    async (_, { cancelActiveListeners, dispatch }) => {
      cancelActiveListeners();
      // TODO see SettingsStateInitMiddleware - should load all programs from disk
      dispatch(setIsHydrated(true));
    },
  );
  // TODO we might need a generic handler which sets settings values from dispatched actions

  addExportPlaintextEffects();
  addExportBackupEffects();
}
