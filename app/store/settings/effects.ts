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
  setShowTips,
  setTipToShow,
  setUseImperialUnits,
} from '@/store/settings';
import { addExportBackupEffects } from '@/store/settings/export-backup-effects';
import { addExportPlaintextEffects } from '@/store/settings/export-plaintext-effects';
import { addImportBackupEffects } from '@/store/settings/import-backup-effects';
import { addRemoteBackupEffects } from '@/store/settings/remote-backup-effects';
import Purchases from 'react-native-purchases';
import { Platform } from 'react-native';
import { captureException } from '@sentry/react-native';

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

      if (Platform.OS === 'ios') {
        Purchases.configure({
          apiKey: process.env.EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY!,
        });
      } else if (Platform.OS === 'android') {
        Purchases.configure({
          apiKey: process.env.EXPO_PUBLIC_REVENUECAT_GOOGLE_API_KEY!,
        });
      }
      // migrate pro token to a revenuecat
      if (proToken && !proToken.startsWith('$RCAnonymousID')) {
        try {
          const customerInfo = await Purchases.getCustomerInfo();
          await Purchases.syncPurchases();
          setProToken(customerInfo.originalAppUserId);
          await preferenceService.setProToken(customerInfo.originalAppUserId);
        } catch (err) {
          captureException(
            new Error('Failed to sync customer', { cause: err }),
          );
        }
      }
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
    setProToken,
    async (action, { stateAfterReduce, extra: { preferenceService } }) => {
      if (stateAfterReduce.settings.isHydrated) {
        await preferenceService.setProToken(action.payload);
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
