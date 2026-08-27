import { RemoteData } from '@/models/remote';
import { AddEffectFn } from '@/store/store';
import {
  initializeSettingsStateSlice,
  setExportToHealthAggregator,
  setIsHydrated,
  setLastBackup,
  setPreferredLanguage,
  setProToken,
  setRemoteBackupSettings,
} from '@/store/settings';
import {
  buildPreferenceAction,
  isPreferenceAction,
  preferenceKeys,
  preferenceRegistry,
  PrefKey,
  PrefValue,
  setterForKey,
} from '@/store/settings/registry';
import { addExportBackupEffects } from '@/store/settings/export-backup-effects';
import { addExportPlaintextEffects } from '@/store/settings/export-plaintext-effects';
import { addImportBackupEffects } from '@/store/settings/import-backup-effects';
import { addImportExternalEffects } from '@/store/settings/import-external-effects';
import { addRemoteBackupEffects } from '@/store/settings/remote-backup-effects';

import Purchases from 'react-native-purchases';
import { I18nManager, Platform } from 'react-native';
import { detectLanguageFromDateLocale } from '@/utils/language-detector';
import { supportedLanguages } from '@/services/tolgee';
import { initializeStoredSessionsStateSlice } from '@/store/stored-sessions';

// Read every generically-hydrated key, then dispatch its setter.
async function hydrateGenericPreferences(
  preferenceService: { getPreference: <K extends PrefKey>(key: K) => Promise<PrefValue<K>> },
  dispatch: (action: unknown) => void,
) {
  const keys = preferenceKeys.filter(
    (key) => preferenceRegistry[key].codec && (preferenceRegistry[key].hydrate ?? 'generic') === 'generic',
  );
  await Promise.all(
    keys.map(async (key) => {
      const value = await preferenceService.getPreference(key);
      dispatch(buildPreferenceAction(key, value));
    }),
  );
}

export function applySettingsEffects(addEffect: AddEffectFn) {
  addEffect(
    initializeSettingsStateSlice,
    async (_, { cancelActiveListeners, dispatch, extra: { preferenceService, logger } }) => {
      const start = performance.now();
      cancelActiveListeners();

      await hydrateGenericPreferences(preferenceService, dispatch);

      // Bespoke hydration: sync read, composite keys, and composed values.
      dispatch(setPreferredLanguage(preferenceService.getPreferredLanguage()));

      const remoteBackupSettings = await preferenceService.getRemoteBackupSettings();
      dispatch(setRemoteBackupSettings(remoteBackupSettings));

      const [lastSuccessfulRemoteBackupHash, lastBackupTime] = await Promise.all([
        preferenceService.getLastSuccessfulRemoteBackupHash(),
        preferenceService.getLastBackupTime(),
      ]);
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

      const proToken = await preferenceService.getProToken();
      dispatch(setProToken(proToken));

      if (!__DEV__) {
        if (Platform.OS === 'ios') {
          Purchases.configure({
            apiKey: process.env.EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY!,
          });
        } else if (Platform.OS === 'android') {
          Purchases.configure({
            apiKey: process.env.EXPO_PUBLIC_REVENUECAT_GOOGLE_API_KEY!,
          });
        }
      }
      // migrate pro token to a revenuecat
      if (proToken && !proToken.startsWith('$RCAnonymousID')) {
        try {
          const customerInfo = await Purchases.getCustomerInfo();
          await Purchases.syncPurchases();
          dispatch(setProToken(customerInfo.originalAppUserId));
          await preferenceService.setProToken(customerInfo.originalAppUserId);
        } catch (err) {
          logger.error('Failed to migrate user', err);
        }
      }
      dispatch(setIsHydrated(true));
      dispatch(initializeStoredSessionsStateSlice());
      const end = performance.now();
      logger.log(`initializeSettingsStateSlice effect took ${(end - start).toFixed(2)}ms`);
    },
  );

  // Generic persistence: one matcher over every key that opts into auto write-back.
  // The isHydrated guard stops the hydration dispatches above from writing straight
  // back what they just read.
  const persistedSetters = preferenceKeys
    .filter((key) => preferenceRegistry[key].codec && preferenceRegistry[key].persist !== false)
    .map((key) => setterForKey(key));
  addEffect(persistedSetters, async (action, { stateAfterReduce, extra: { preferenceService } }) => {
    if (!stateAfterReduce.settings.isHydrated || !isPreferenceAction(action)) {
      return;
    }
    await preferenceService.setPreference(action.meta.prefKey, action.payload as PrefValue<PrefKey>);
  });

  // Bespoke write-back for keys the generic effect skips (persist: false).
  addEffect(setPreferredLanguage, async (action, { stateAfterReduce, extra: { preferenceService, tolgee } }) => {
    if (stateAfterReduce.settings.isHydrated) {
      await preferenceService.setPreferredLanguage(action.payload);
    }
    const languageCode = action.payload ?? detectLanguageFromDateLocale(supportedLanguages.map((x) => x.code)) ?? 'en';
    const languageSettings = supportedLanguages.find((x) => x.code === languageCode);
    await tolgee.changeLanguage(languageCode);
    I18nManager.forceRTL(!!languageSettings?.isRTL);
  });

  addEffect(
    setExportToHealthAggregator,
    async (action, { stateAfterReduce, dispatch, extra: { preferenceService, healthExportService } }) => {
      if (action.payload && !healthExportService.canExport()) {
        dispatch(setExportToHealthAggregator(false));
        return;
      }
      if (stateAfterReduce.settings.isHydrated) {
        if (action.payload) {
          await healthExportService.requestPermission();
        }
        await preferenceService.setPreference('exportToHealthAggregator', action.payload);
      }
    },
  );

  addEffect(setProToken, async (action, { stateAfterReduce, extra: { preferenceService } }) => {
    if (stateAfterReduce.settings.isHydrated) {
      await preferenceService.setProToken(action.payload);
    }
  });

  addEffect(setRemoteBackupSettings, async (action, { stateAfterReduce, extra: { preferenceService } }) => {
    if (stateAfterReduce.settings.isHydrated) {
      await preferenceService.setRemoteBackupSettings(action.payload);
    }
  });

  addEffect(setLastBackup, async (action, { stateAfterReduce, extra: { preferenceService } }) => {
    if (stateAfterReduce.settings.isHydrated && action.payload.isSuccess()) {
      await preferenceService.setLastBackupTime(action.payload.data.lastBackupTime);
      await preferenceService.setLastSuccessfulRemoteBackupHash(action.payload.data.lastSuccessfulRemoteBackupHash);
    }
  });

  addExportPlaintextEffects(addEffect);
  addExportBackupEffects(addEffect);
  addImportBackupEffects(addEffect);
  addImportExternalEffects(addEffect);
  addRemoteBackupEffects(addEffect);
}
