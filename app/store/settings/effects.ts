import { RemoteData } from '@/models/remote';
import { addEffect } from '@/store/store';
import {
  initializeSettingsStateSlice,
  setBackupReminder,
  setColorSchemeSeed,
  setCrashReportsEnabled,
  setFirstDayOfWeek,
  setIsHydrated,
  setKeepScreenAwakeDuringWorkout,
  setLastBackup,
  setNotesExpandedByDefault,
  setPreferredLanguage,
  setProToken,
  setRemoteBackupSettings,
  setRestNotifications,
  setShowBodyweight,
  setShowFeed,
  setShowTips,
  setTipToShow,
  setUseImperialUnits,
  setWelcomeWizardCompleted,
} from '@/store/settings';
import { addExportBackupEffects } from '@/store/settings/export-backup-effects';
import { addExportPlaintextEffects } from '@/store/settings/export-plaintext-effects';
import { addImportBackupEffects } from '@/store/settings/import-backup-effects';
import { addRemoteBackupEffects } from '@/store/settings/remote-backup-effects';
import Purchases from 'react-native-purchases';
import { I18nManager, Platform } from 'react-native';
import { captureException } from '@sentry/react-native';
import { detectLanguageFromDateLocale } from '@/utils/language-detector';
import { supportedLanguages } from '@/services/tolgee';
import { initializeStoredSessionsStateSlice } from '@/store/stored-sessions';
import { initializeCurrentSessionStateSlice } from '@/store/current-session';
import * as Sentry from '@sentry/react-native';

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
        crashReportsEnabled,
        welcomeWizardCompleted,
        remoteBackupSettings,
        lastSuccessfulRemoteBackupHash,
        lastBackupTime,
        backupReminder,
        firstDayOfWeek,
        colorSchemeSeed,
        proToken,
        notesExpandedByDefault,
        keepScreenAwakeDuringWorkout,
      ] = await Promise.all([
        preferenceService.getUseImperialUnits(),
        preferenceService.getShowBodyweight(),
        preferenceService.getShowTips(),
        preferenceService.getTipToShow(),
        preferenceService.getShowFeed(),
        preferenceService.getRestNotifications(),
        preferenceService.getCrashReportsEnabled(),
        preferenceService.getWelcomeWizardCompleted(),
        preferenceService.getRemoteBackupSettings(),
        preferenceService.getLastSuccessfulRemoteBackupHash(),
        preferenceService.getLastBackupTime(),
        preferenceService.getBackupReminder(),
        preferenceService.getFirstDayOfWeek(),
        preferenceService.getColorSchemeSeed(),
        preferenceService.getProToken(),
        preferenceService.getNotesExpandedByDefault(),
        preferenceService.getKeepScreenAwakeDuringWorkout(),
      ]);
      dispatch(setColorSchemeSeed(colorSchemeSeed));
      dispatch(setUseImperialUnits(useImperialUnits));
      dispatch(setShowBodyweight(showBodyweight));
      dispatch(setShowTips(showTips));
      dispatch(setTipToShow(tipToShow));
      dispatch(setShowFeed(showFeed));
      dispatch(setRestNotifications(restNotifications));
      dispatch(setCrashReportsEnabled(crashReportsEnabled));
      dispatch(setWelcomeWizardCompleted(welcomeWizardCompleted));
      dispatch(setRemoteBackupSettings(remoteBackupSettings));
      dispatch(setPreferredLanguage(preferenceService.getPreferredLanguage()));
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
      dispatch(setNotesExpandedByDefault(notesExpandedByDefault));
      dispatch(setKeepScreenAwakeDuringWorkout(keepScreenAwakeDuringWorkout));

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
          dispatch(setProToken(customerInfo.originalAppUserId));
          await preferenceService.setProToken(customerInfo.originalAppUserId);
        } catch (err) {
          captureException(
            new Error('Failed to sync customer', { cause: err }),
          );
        }
      }
      dispatch(setIsHydrated(true));
      dispatch(initializeStoredSessionsStateSlice());
      dispatch(initializeCurrentSessionStateSlice());
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
    setPreferredLanguage,
    async (
      action,
      { stateAfterReduce, extra: { preferenceService, tolgee } },
    ) => {
      if (stateAfterReduce.settings.isHydrated) {
        await preferenceService.setPreferredLanguage(action.payload);
      }
      const languageCode =
        action.payload ??
        detectLanguageFromDateLocale(supportedLanguages.map((x) => x.code));
      const languageSettings = supportedLanguages.find(
        (x) => x.code === languageCode,
      );
      await tolgee.changeLanguage(languageCode);
      I18nManager.forceRTL(!!languageSettings?.isRTL);
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
    setCrashReportsEnabled,
    async (action, { stateAfterReduce, extra: { preferenceService } }) => {
      if (stateAfterReduce.settings.isHydrated) {
        await preferenceService.setCrashReportsEnabled(action.payload);
      }
      if (action.payload) {
        Sentry.init({
          dsn: 'https://86576716425e1558b5e8622ba65d4544@o4505937515249664.ingest.us.sentry.io/4509717493383168',

          // Adds more context data to events (IP address, cookies, user, etc.)
          // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
          sendDefaultPii: true,

          // uncomment the line below to enable Spotlight (https://spotlightjs.com)
          // spotlight: __DEV__,
          attachViewHierarchy: true,
        });
      } else {
        await Sentry.close();
      }
    },
  );
  addEffect(
    setWelcomeWizardCompleted,
    async (action, { stateAfterReduce, extra: { preferenceService } }) => {
      if (stateAfterReduce.settings.isHydrated) {
        await preferenceService.setWelcomeWizardCompleted(action.payload);
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

  addEffect(
    setNotesExpandedByDefault,
    async (action, { stateAfterReduce, extra: { preferenceService } }) => {
      if (stateAfterReduce.settings.isHydrated) {
        await preferenceService.setNotesExpandedByDefault(action.payload);
      }
    },
  );

  addEffect(
    setKeepScreenAwakeDuringWorkout,
    async (action, { stateAfterReduce, extra: { preferenceService } }) => {
      if (stateAfterReduce.settings.isHydrated) {
        await preferenceService.setKeepScreenAwakeDuringWorkout(action.payload);
      }
    },
  );

  addExportPlaintextEffects();
  addExportBackupEffects();
  addImportBackupEffects();
  addRemoteBackupEffects();
}
