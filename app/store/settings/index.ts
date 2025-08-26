import { LiftLog } from '@/gen/proto';
import { RemoteData } from '@/models/remote';
import { DayOfWeek, Instant } from '@js-joda/core';
import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';

export type ColorSchemeSeed = 'default' | `#${string}`;

export type LastBackup = {
  lastSuccessfulRemoteBackupHash: string;
  lastBackupTime: Instant;
  settings: RemoteBackupSettings;
};

interface SettingsState {
  firstDayOfWeek: DayOfWeek;
  isHydrated: boolean;
  proToken: string | undefined;
  useImperialUnits: boolean;
  showBodyweight: boolean;
  showTips: boolean;
  tipToShow: number;
  showFeed: boolean;
  restNotifications: boolean;
  remoteBackupSettings: RemoteBackupSettings;
  lastBackup: RemoteData<LastBackup, string>;
  backupReminder: boolean;
  colorSchemeSeed: ColorSchemeSeed;
  preferredLanguage: string | undefined;
  notesExpandedByDefault: boolean;
}

interface RemoteBackupSettings {
  endpoint: string;
  apiKey: string;
  includeFeedAccount: boolean;
}

const initialState: SettingsState = {
  isHydrated: false,
  firstDayOfWeek: DayOfWeek.SUNDAY,
  useImperialUnits: false,
  showBodyweight: true,
  showTips: true,
  tipToShow: 1,
  showFeed: true,
  restNotifications: true,
  proToken: undefined,
  remoteBackupSettings: {
    endpoint: '',
    apiKey: '',
    includeFeedAccount: false,
  },
  lastBackup: RemoteData.notAsked(),
  backupReminder: true,
  colorSchemeSeed: 'default',
  preferredLanguage: undefined,
  notesExpandedByDefault: false,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setIsHydrated(state, action: PayloadAction<boolean>) {
      state.isHydrated = action.payload;
    },
    setUseImperialUnits(state, action: PayloadAction<boolean>) {
      state.useImperialUnits = action.payload;
    },
    setShowBodyweight(state, action: PayloadAction<boolean>) {
      state.showBodyweight = action.payload;
    },
    setShowTips(state, action: PayloadAction<boolean>) {
      state.showTips = action.payload;
    },
    setTipToShow(state, action: PayloadAction<number>) {
      state.tipToShow = action.payload;
    },
    setShowFeed(state, action: PayloadAction<boolean>) {
      state.showFeed = action.payload;
    },
    setRestNotifications(state, action: PayloadAction<boolean>) {
      state.restNotifications = action.payload;
    },
    setNotesExpandedByDefault(state, action: PayloadAction<boolean>) {
      state.notesExpandedByDefault = action.payload;
    },
    setRemoteBackupSettings(
      state,
      action: PayloadAction<RemoteBackupSettings>,
    ) {
      state.remoteBackupSettings = action.payload;
    },
    setProToken(state, action: PayloadAction<string | undefined>) {
      state.proToken = action.payload;
    },
    setLastBackup(
      state,
      action: PayloadAction<RemoteData<LastBackup, string>>,
    ) {
      state.lastBackup = action.payload;
    },
    setBackupReminder(state, action: PayloadAction<boolean>) {
      state.backupReminder = action.payload;
    },
    setColorSchemeSeed(state, action: PayloadAction<ColorSchemeSeed>) {
      state.colorSchemeSeed = action.payload;
    },
    setFirstDayOfWeek(state, action: PayloadAction<DayOfWeek>) {
      state.firstDayOfWeek = action.payload;
    },
    setPreferredLanguage(state, action: PayloadAction<string | undefined>) {
      state.preferredLanguage = action.payload;
    },
  },
});
export const initializeSettingsStateSlice = createAction(
  'initializeSettingsStateSlice',
);
export type PlaintextExportFormat = 'CSV';

export const importData = createAction('importData');
export const importDataDao = createAction<{
  dao: LiftLog.Ui.Models.ExportedDataDao.ExportedDataDaoV2;
}>('importDataDao');
export const beginFeedImport =
  createAction<LiftLog.Ui.Models.IFeedStateDaoV1>('beginFeedImport');
export const exportData = createAction<{ includeFeed: boolean }>('exportData');

export const exportPlainText = createAction<{ format: PlaintextExportFormat }>(
  'exportPlainText',
);

export const executeRemoteBackup = createAction<{
  settings?: RemoteBackupSettings;
  force?: boolean;
}>('executeRemoteBackup');

export const remoteBackupSucceeded = createAction('remoteBackupSucceeded');

export const {
  setIsHydrated,
  setUseImperialUnits,
  setShowBodyweight,
  setShowTips,
  setTipToShow,
  setShowFeed,
  setRestNotifications,
  setRemoteBackupSettings,
  setLastBackup,
  setBackupReminder,
  setColorSchemeSeed,
  setFirstDayOfWeek,
  setProToken,
  setPreferredLanguage,
  setNotesExpandedByDefault,
} = settingsSlice.actions;

export const settingsReducer = settingsSlice.reducer;
