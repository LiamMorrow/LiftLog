import { RemoteData } from '@/models/remote';
import { addEffect } from '@/store/store';
import {
  initializeSettingsStateSlice,
  setBackupReminder,
  setColorSchemeSeed,
  setFirstDayOfWeek,
  setIsHydrated,
  setLastBackup,
  setProToken,
  setRemoteBackupSettings,
  setRestNotifications,
  setShowBodyweight,
  setShowFeed,
  setShowTips,
  setTipToShow,
  setUseImperialUnits,
} from '@/store/settings';
import { addExportBackupEffects } from '@/store/settings/export-backup-effects';
import { addExportPlaintextEffects } from '@/store/settings/export-plaintext-effects';
import { addImportBackupEffects } from '@/store/settings/import-backup-effects';
import { addRemoteBackupEffects } from '@/store/settings/remote-backup-effects';

export function applySettingsEffects() {
  addEffect(
    initializeSettingsStateSlice,
    async (
      _,
      { cancelActiveListeners, dispatch, extra: { preferenceService } },
    ) => {
      const start = performance.now();
      cancelActiveListeners();

      const [
        useImperialUnits,
        showBodyweight,
        showTips,
        tipToShow,
        showFeed,
        restNotifications,
        remoteBackupSettings,
        lastSuccessfulRemoteBackupHash,
        lastBackupTime,
        backupReminder,
        firstDayOfWeek,
        colorSchemeSeed,
        proToken,
      ] = await Promise.all([
        preferenceService.getUseImperialUnits(),
        preferenceService.getShowBodyweight(),
        preferenceService.getShowTips(),
        preferenceService.getTipToShow(),
        preferenceService.getShowFeed(),
        preferenceService.getRestNotifications(),
        preferenceService.getRemoteBackupSettings(),
        preferenceService.getLastSuccessfulRemoteBackupHash(),
        preferenceService.getLastBackupTime(),
        preferenceService.getBackupReminder(),
        preferenceService.getFirstDayOfWeek(),
        preferenceService.getColorSchemeSeed(),
        preferenceService.getProToken(),
      ]);
      dispatch(setColorSchemeSeed(colorSchemeSeed));
      dispatch(setUseImperialUnits(useImperialUnits));
      dispatch(setShowBodyweight(showBodyweight));
      dispatch(setShowTips(showTips));
      dispatch(setTipToShow(tipToShow));
      dispatch(setShowFeed(showFeed));
      dispatch(setRestNotifications(restNotifications));
      dispatch(setRemoteBackupSettings(remoteBackupSettings));
      dispatch(
        setLastBackup(
          lastSuccessfulRemoteBackupHash
            ? RemoteData.success({
                lastSuccessfulRemoteBackupHash: lastSuccessfulRemoteBackupHash,
                lastBackupTime: lastBackupTime,
                settings: remoteBackupSettings,
              })
            : RemoteData.notAsked(),
        ),
      );
      dispatch(setBackupReminder(backupReminder));
      dispatch(setFirstDayOfWeek(firstDayOfWeek));
      dispatch(setProToken(proToken));

      dispatch(setIsHydrated(true));
      const end = performance.now();
      console.log(
        `initializeSettingsStateSlice effect took ${(end - start).toFixed(2)}ms`,
      );
    },
  );

  addEffect(
    setUseImperialUnits,
    async (action, { stateAfterReduce, extra: { preferenceService } }) => {
      if (stateAfterReduce.settings.isHydrated) {
        await preferenceService.setUseImperialUnits(action.payload);
      }
    },
  );
  addEffect(
    setShowBodyweight,
    async (action, { stateAfterReduce, extra: { preferenceService } }) => {
      if (stateAfterReduce.settings.isHydrated) {
        await preferenceService.setShowBodyweight(action.payload);
      }
    },
  );
  addEffect(
    setShowTips,
    async (action, { stateAfterReduce, extra: { preferenceService } }) => {
      if (stateAfterReduce.settings.isHydrated) {
        await preferenceService.setShowTips(action.payload);
      }
    },
  );
  addEffect(
    setTipToShow,
    async (action, { stateAfterReduce, extra: { preferenceService } }) => {
      if (stateAfterReduce.settings.isHydrated) {
        await preferenceService.setTipToShow(action.payload);
      }
    },
  );
  addEffect(
    setShowFeed,
    async (action, { stateAfterReduce, extra: { preferenceService } }) => {
      if (stateAfterReduce.settings.isHydrated) {
        await preferenceService.setShowFeed(action.payload);
      }
    },
  );
  addEffect(
    setRestNotifications,
    async (action, { stateAfterReduce, extra: { preferenceService } }) => {
      if (stateAfterReduce.settings.isHydrated) {
        await preferenceService.setRestNotifications(action.payload);
      }
    },
  );
  addEffect(
    setRemoteBackupSettings,
    async (action, { stateAfterReduce, extra: { preferenceService } }) => {
      if (stateAfterReduce.settings.isHydrated) {
        await preferenceService.setRemoteBackupSettings(action.payload);
      }
    },
  );
  addEffect(
    setLastBackup,
    async (action, { stateAfterReduce, extra: { preferenceService } }) => {
      if (stateAfterReduce.settings.isHydrated && action.payload.isSuccess()) {
        await preferenceService.setLastBackupTime(
          action.payload.data.lastBackupTime,
        );
        await preferenceService.setLastSuccessfulRemoteBackupHash(
          action.payload.data.lastSuccessfulRemoteBackupHash,
        );
      }
    },
  );
  addEffect(
    setBackupReminder,
    async (action, { stateAfterReduce, extra: { preferenceService } }) => {
      if (stateAfterReduce.settings.isHydrated) {
        await preferenceService.setBackupReminder(action.payload);
      }
    },
  );
  addEffect(
    setFirstDayOfWeek,
    async (action, { stateAfterReduce, extra: { preferenceService } }) => {
      if (stateAfterReduce.settings.isHydrated) {
        await preferenceService.setFirstDayOfWeek(action.payload);
      }
    },
  );

  addEffect(
    setColorSchemeSeed,
    async (action, { stateAfterReduce, extra: { preferenceService } }) => {
      if (stateAfterReduce.settings.isHydrated) {
        await preferenceService.setColorSchemeSeed(action.payload);
      }
    },
  );

  addExportPlaintextEffects();
  addExportBackupEffects();
  addImportBackupEffects();
  addRemoteBackupEffects();
}
