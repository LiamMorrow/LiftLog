import { KeyValueStore } from '@/services/key-value-store';
import { ColorSchemeSeed } from '@/store/settings';
import { DayOfWeek, Instant } from '@js-joda/core';
import { match, P } from 'ts-pattern';

export enum AppRatingResult {
  NotRated = 'NotRated',
  Rated = 'Rated',
  Declined = 'Declined',
}

export interface RemoteBackupSettings {
  endpoint: string;
  apiKey: string;
  includeFeedAccount: boolean;
}

function toBooleanString(val: boolean | undefined) {
  return val ? 'True' : 'False';
}

function fromBooleanString(
  val: string | undefined,
  defaultValue: boolean,
): boolean {
  if (val === undefined || val === null) return defaultValue;
  return val === 'True';
}

export class PreferenceService {
  constructor(private keyValueStore: KeyValueStore) {}

  async getProToken(): Promise<string | undefined> {
    const token = await this.keyValueStore.getItem('proToken');
    return token;
  }

  async setProToken(token?: string): Promise<void> {
    if (__DEV__) {
      return;
    }
    if (token) await this.keyValueStore.setItem('proToken', token);
  }

  async getUseImperialUnits(): Promise<boolean> {
    const value = await this.keyValueStore.getItem('useImperialUnits');
    return fromBooleanString(value, false);
  }

  async setUseImperialUnits(useImperialUnits: boolean): Promise<void> {
    await this.keyValueStore.setItem(
      'useImperialUnits',
      toBooleanString(useImperialUnits),
    );
  }

  async getRestNotifications(): Promise<boolean> {
    const value = await this.keyValueStore.getItem('restNotifications');
    return fromBooleanString(value, true);
  }

  async setRestNotifications(restNotifications: boolean): Promise<void> {
    await this.keyValueStore.setItem(
      'restNotifications',
      toBooleanString(restNotifications),
    );
  }

  async getCrashReportsEnabled(): Promise<boolean> {
    const value = await this.keyValueStore.getItem('crashReportsEnabled');
    return fromBooleanString(value, true);
  }

  async setCrashReportsEnabled(crashReportsEnabled: boolean): Promise<void> {
    await this.keyValueStore.setItem(
      'crashReportsEnabled',
      toBooleanString(crashReportsEnabled),
    );
  }

  async getWelcomeWizardCompleted(): Promise<boolean> {
    const value = await this.keyValueStore.getItem('welcomeWizardCompleted');
    return fromBooleanString(value, false);
  }

  async setWelcomeWizardCompleted(
    welcomeWizardCompleted: boolean,
  ): Promise<void> {
    await this.keyValueStore.setItem(
      'welcomeWizardCompleted',
      toBooleanString(welcomeWizardCompleted),
    );
  }

  async setShowBodyweight(showBodyweight: boolean): Promise<void> {
    await this.keyValueStore.setItem(
      'showBodyweight',
      toBooleanString(showBodyweight),
    );
  }

  async getShowBodyweight(): Promise<boolean> {
    const value = await this.keyValueStore.getItem('showBodyweight');
    return fromBooleanString(value, true);
  }

  async setShowTips(showTips: boolean): Promise<void> {
    await this.keyValueStore.setItem('showTips', toBooleanString(showTips));
  }

  async getShowTips(): Promise<boolean> {
    const value = await this.keyValueStore.getItem('showTips');
    return fromBooleanString(value, true);
  }

  async setTipToShow(tipToShow: number): Promise<void> {
    await this.keyValueStore.setItem('tipToShow', tipToShow.toString());
  }

  async getTipToShow(): Promise<number> {
    const value = await this.keyValueStore.getItem('tipToShow');
    const parsed = parseInt(value ?? '', 10);
    return isNaN(parsed) ? 1 : parsed;
  }

  async setShowFeed(showFeed: boolean): Promise<void> {
    await this.keyValueStore.setItem('showFeed', toBooleanString(showFeed));
  }

  async getShowFeed(): Promise<boolean> {
    const value = await this.keyValueStore.getItem('showFeed');
    return fromBooleanString(value, true);
  }

  async getRemoteBackupSettings(): Promise<RemoteBackupSettings> {
    const [endpoint, apiKey, includeFeedAccount] = await Promise.all([
      this.keyValueStore.getItem('remoteBackupSettings.Endpoint'),
      this.keyValueStore.getItem('remoteBackupSettings.ApiKey'),
      this.keyValueStore.getItem('remoteBackupSettings.IncludeFeedAccount'),
    ]);
    return {
      endpoint: endpoint ?? '',
      apiKey: apiKey ?? '',
      includeFeedAccount: fromBooleanString(includeFeedAccount, false),
    };
  }

  async setRemoteBackupSettings(settings: RemoteBackupSettings): Promise<void> {
    await this.keyValueStore.setItem(
      'remoteBackupSettings.Endpoint',
      settings.endpoint,
    );
    await this.keyValueStore.setItem(
      'remoteBackupSettings.ApiKey',
      settings.apiKey,
    );
    await this.keyValueStore.setItem(
      'remoteBackupSettings.IncludeFeedAccount',
      toBooleanString(settings.includeFeedAccount),
    );
  }

  async setLastSuccessfulRemoteBackupHash(hash: string): Promise<void> {
    await this.keyValueStore.setItem('lastSuccessfulRemoteBackupHash', hash);
  }

  async getLastSuccessfulRemoteBackupHash(): Promise<string | undefined> {
    return (
      (await this.keyValueStore.getItem('lastSuccessfulRemoteBackupHash')) ??
      undefined
    );
  }

  async setLastBackupTime(time: Instant): Promise<void> {
    await this.keyValueStore.setItem('lastBackupTime', time.toString());
  }

  async getLastBackupTime(): Promise<Instant> {
    const value = await this.keyValueStore.getItem('lastBackupTime');
    if (value) {
      try {
        const date = Instant.parse(value);
        return date;
      } catch {}
    }
    const now = Instant.now();
    await this.setLastBackupTime(now);
    return now;
  }

  async setBackupReminder(showReminder: boolean): Promise<void> {
    await this.keyValueStore.setItem(
      'backupReminder',
      toBooleanString(showReminder),
    );
  }

  async getBackupReminder(): Promise<boolean> {
    const value = await this.keyValueStore.getItem('backupReminder');
    return fromBooleanString(value, true);
  }

  async getNotesExpandedByDefault(): Promise<boolean> {
    const value = await this.keyValueStore.getItem('notesExpandedByDefault');
    return fromBooleanString(value, true);
  }

  async setNotesExpandedByDefault(value: boolean): Promise<void> {
    await this.keyValueStore.setItem(
      'notesExpandedByDefault',
      toBooleanString(value),
    );
  }

  async getKeepScreenAwakeDuringWorkout(): Promise<boolean> {
    const value = await this.keyValueStore.getItem(
      'keepScreenAwakeDuringWorkout',
    );
    return fromBooleanString(value, true);
  }

  async setKeepScreenAwakeDuringWorkout(value: boolean): Promise<void> {
    await this.keyValueStore.setItem(
      'keepScreenAwakeDuringWorkout',
      toBooleanString(value),
    );
  }

  async setColorSchemeSeed(payload: ColorSchemeSeed): Promise<void> {
    await this.keyValueStore.setItem('colorSchemeSeed', payload);
  }

  async getColorSchemeSeed(): Promise<ColorSchemeSeed> {
    const value = await this.keyValueStore.getItem('colorSchemeSeed');
    return match(value)
      .returnType<ColorSchemeSeed>()
      .with(P.string.regex(/^#[0-9a-fA-F]{6}$/), (v) => v as ColorSchemeSeed)
      .otherwise(() => 'default');
  }

  async setFirstDayOfWeek(firstDayOfWeek: DayOfWeek): Promise<void> {
    await this.keyValueStore.setItem('firstDayOfWeek', firstDayOfWeek.name());
  }

  async getFirstDayOfWeek(): Promise<DayOfWeek> {
    const value = await this.keyValueStore.getItem('firstDayOfWeek');
    return match(value?.toLowerCase())
      .with('sunday', () => DayOfWeek.SUNDAY)
      .with('monday', () => DayOfWeek.MONDAY)
      .with('tuesday', () => DayOfWeek.TUESDAY)
      .with('wednesday', () => DayOfWeek.WEDNESDAY)
      .with('thursday', () => DayOfWeek.THURSDAY)
      .with('friday', () => DayOfWeek.FRIDAY)
      .with('saturday', () => DayOfWeek.SATURDAY)
      .otherwise(() => DayOfWeek.SUNDAY);
  }

  getPreferredLanguage() {
    return this.keyValueStore.getItemSync('preferredLanguage');
  }

  setPreferredLanguage(lang: string | undefined) {
    return lang
      ? this.keyValueStore.setItem('preferredLanguage', lang)
      : this.keyValueStore.removeItem('preferredLanguage');
  }
}
