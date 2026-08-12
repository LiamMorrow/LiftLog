import { LiftLog } from '@/gen/proto';
import { whatsNewEntries, WhatsNewEntry } from '@/models/whats-new';
import type { RootState } from '@/store';
import { BackupData, FeedBackupData } from '@/models/backup';
import type { ExternalImportFormat } from '@/services/csv-import';
import { WeightUnit } from '@/models/weight';
import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SQLiteDatabase } from 'expo-sqlite';
import {
  isPreferenceAction,
  LastBackup,
  preferenceKeys,
  preferenceRegistry,
  preferenceSetters,
  PrefKey,
  PrefValue,
  RemoteBackupSettings,
} from './registry';

export type { ColorSchemeSeed } from './codecs';
export type { RemoteBackupSettings, LastBackup };
export type { ExternalImportFormat };

type PreferenceState = { [K in PrefKey]: PrefValue<K> };
type SettingsState = PreferenceState & { isHydrated: boolean };

const initialState: SettingsState = {
  ...(Object.fromEntries(preferenceKeys.map((key) => [key, preferenceRegistry[key].default])) as PreferenceState),
  isHydrated: false,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setIsHydrated(state, action: PayloadAction<boolean>) {
      state.isHydrated = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Every generated setter carries its key in `meta`, so one matcher applies
    // them all — no per-key reducer.
    builder.addMatcher(isPreferenceAction, (state, action) => {
      (state as Record<PrefKey, unknown>)[action.meta.prefKey] = action.payload;
    });
  },
  selectors: {
    selectPreferredWeightUnit: (state): WeightUnit => (state.useImperialUnits ? 'pounds' : 'kilograms'),
  },
});
export const initializeSettingsStateSlice = createAction('initializeSettingsStateSlice');
export type PlaintextExportFormat = 'CSV' | 'JSON';

export const importData = createAction('importData');
export const importDataSql = createAction<{ db: SQLiteDatabase }>('importDataSql');
export const importDataProto = createAction<{
  dao: LiftLog.Ui.Models.ExportedDataDao.ExportedDataDaoV2;
}>('importDataProto');
export type ImportBackupDataPayload = BackupData & {
  /** When set, used instead of the default restore success snackbar. */
  successMessage?: string;
};
export const importBackupData = createAction<ImportBackupDataPayload>('importBackupData');
export const beginFeedImport = createAction<FeedBackupData>('beginFeedImport');
export const exportData = createAction<{ includeFeed: boolean }>('exportData');

export const exportPlainText = createAction<{ format: PlaintextExportFormat }>('exportPlainText');

/** Pick a third-party export file and merge history via importBackupData. */
export const importFromExternal = createAction<{ format: ExternalImportFormat }>('importFromExternal');

export const executeRemoteBackup = createAction<{
  settings?: RemoteBackupSettings;
  force?: boolean;
}>('executeRemoteBackup');

export const remoteBackupSucceeded = createAction('remoteBackupSucceeded');

export const { setIsHydrated } = settingsSlice.actions;

export const {
  setUseImperialUnits,
  setShowBodyweight,
  setShowTips,
  setTipToShow,
  setLastSeenWhatsNewId,
  setShowFeed,
  setRestNotifications,
  setRestTimersEnabled,
  setCrashReportsEnabled,
  setWelcomeWizardCompleted,
  setRemoteBackupSettings,
  setLastBackup,
  setBackupReminder,
  setColorSchemeSeed,
  setFirstDayOfWeek,
  setProToken,
  setPreferredLanguage,
  setNotesExpandedByDefault,
  setKeepScreenAwakeDuringWorkout,
  setExportToHealthAggregator,
  setShowPostWorkoutSummary,
  setTrueBlackDarkTheme,
} = preferenceSetters;

export const { selectPreferredWeightUnit } = settingsSlice.selectors;

export const selectApplicableWhatsNew = (state: RootState): WhatsNewEntry[] =>
  whatsNewEntries.filter((entry) => entry.condition?.(state) ?? true);

export const selectUnseenWhatsNew = (state: RootState): WhatsNewEntry[] =>
  selectApplicableWhatsNew(state).filter((entry) => entry.id > state.settings.lastSeenWhatsNewId);

export const selectHasUnseenWhatsNew = (state: RootState): boolean => selectUnseenWhatsNew(state).length > 0;

export const settingsReducer = settingsSlice.reducer;
