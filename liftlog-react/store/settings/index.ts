import { AiWorkoutAttributes, AiWorkoutPlan } from '@/models/ai-models';
import { RemoteData } from '@/models/remote';
import { FeedState } from '@/store/feed';
import { Instant } from '@js-joda/core';
import {
  createAction,
  createSlice,
  Draft,
  PayloadAction,
} from '@reduxjs/toolkit';

export type ColorSchemeSeed = 'default' | `#${string}`;

export type LastBackup = {
  lastSuccessfulRemoteBackupHash: string;
  lastBackupTime: Instant;
  settings: RemoteBackupSettings;
};

interface SettingsState {
  // 0 based, sunday being 0
  firstDayOfWeek: number;
  isHydrated: boolean;
  aiWorkoutAttributes: AiWorkoutAttributes | undefined;
  isGeneratingAiPlan: boolean;
  aiPlanError: string | undefined;
  aiPlan: AiWorkoutPlan | undefined;
  useImperialUnits: boolean;
  showBodyweight: boolean;
  showTips: boolean;
  tipToShow: number;
  showFeed: boolean;
  restNotifications: boolean;
  remoteBackupSettings: RemoteBackupSettings;
  lastBackup: RemoteData<LastBackup, string>;
  backupReminder: boolean;
  splitWeightByDefault: boolean;
  colorSchemeSeed: ColorSchemeSeed;
}

interface RemoteBackupSettings {
  endpoint: string;
  apiKey: string;
  includeFeedAccount: boolean;
}

const initialState: SettingsState = {
  isHydrated: false,
  firstDayOfWeek: 0,
  aiWorkoutAttributes: undefined,
  isGeneratingAiPlan: false,
  aiPlanError: undefined,
  aiPlan: undefined,
  useImperialUnits: false,
  showBodyweight: true,
  showTips: true,
  tipToShow: 1,
  showFeed: true,
  restNotifications: true,
  remoteBackupSettings: {
    endpoint: '',
    apiKey: '',
    includeFeedAccount: false,
  },
  lastBackup: RemoteData.notAsked(),
  backupReminder: true,
  splitWeightByDefault: false,
  colorSchemeSeed: 'default',
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setIsHydrated(state, action: PayloadAction<boolean>) {
      state.isHydrated = action.payload;
    },
    setIsGeneratingAiPlan(state, action: PayloadAction<boolean>) {
      state.isGeneratingAiPlan = action.payload;
    },
    setAiPlanError(state, action: PayloadAction<string | undefined>) {
      state.aiPlanError = action.payload;
    },
    setAiPlan(state, action: PayloadAction<AiWorkoutPlan | undefined>) {
      state.aiPlan = action.payload as unknown as Draft<AiWorkoutPlan>;
    },
    setAiWorkoutAttributes(
      state,
      action: PayloadAction<AiWorkoutAttributes | undefined>,
    ) {
      state.aiWorkoutAttributes = action.payload;
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
    setRemoteBackupSettings(
      state,
      action: PayloadAction<RemoteBackupSettings>,
    ) {
      state.remoteBackupSettings = action.payload;
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
    setSplitWeightByDefault(state, action: PayloadAction<boolean>) {
      state.splitWeightByDefault = action.payload;
    },
    setColorSchemeSeed(state, action: PayloadAction<ColorSchemeSeed>) {
      state.colorSchemeSeed = action.payload;
    },
  },
});
export const initializeSettingsStateSlice = createAction(
  'initializeSettingsStateSlice',
);
export type PlaintextExportFormat = 'CSV';

// TODO implement effect (maybe need custom one for web with file picker - see BackupAndRestorePage.razor)
export const importData = createAction('importData');
// TODO implement
export const beginFeedImport = createAction<FeedState>('beginFeedImport');
// TODO implement
export const exportData = createAction<{ includeFeed: boolean }>('exportData');

export const exportPlainText = createAction<{ format: PlaintextExportFormat }>(
  'exportPlainText',
);

// TODO implement
export const executeRemoteBackup = createAction<{
  settings: RemoteBackupSettings;
  force: boolean;
}>('executeRemoteBackup');

export const {
  setIsHydrated,
  setIsGeneratingAiPlan,
  setAiPlanError,
  setAiPlan,
  setAiWorkoutAttributes,
  setUseImperialUnits,
  setShowBodyweight,
  setShowTips,
  setTipToShow,
  setShowFeed,
  setRestNotifications,
  setRemoteBackupSettings,
  setLastBackup,
  setBackupReminder,
  setSplitWeightByDefault,
  setColorSchemeSeed,
} = settingsSlice.actions;

export default settingsSlice.reducer;
