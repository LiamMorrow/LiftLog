import { IKeyValueStore } from '@/services/key-value-store';
import { DayOfWeek, Instant } from '@js-joda/core';
import { match } from 'ts-pattern';

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

export class PreferenceService {
  constructor(private keyValueStore: IKeyValueStore) {}

  async getProToken(): Promise<string | undefined> {
    const token = await this.keyValueStore.getItem('proToken');
    if (token && /^[0-9a-fA-F-]{36}$/.test(token)) return undefined;
    return token ?? undefined;
  }

  async setProToken(token?: string): Promise<void> {
    if (token) await this.keyValueStore.setItem('proToken', token);
  }

  async getUseImperialUnits(): Promise<boolean> {
    const value = await this.keyValueStore.getItem('useImperialUnits');
    return value === 'True';
  }

  async setUseImperialUnits(useImperialUnits: boolean): Promise<void> {
    await this.keyValueStore.setItem(
      'useImperialUnits',
      useImperialUnits.toString(),
    );
  }

  async getRestNotifications(): Promise<boolean> {
    const value = await this.keyValueStore.getItem('restNotifications');
    return value === 'True' || value === null || value === undefined;
  }

  async setRestNotifications(restNotifications: boolean): Promise<void> {
    await this.keyValueStore.setItem(
      'restNotifications',
      restNotifications.toString(),
    );
  }

  async setShowBodyweight(showBodyweight: boolean): Promise<void> {
    await this.keyValueStore.setItem(
      'showBodyweight',
      showBodyweight.toString(),
    );
  }

  async getShowBodyweight(): Promise<boolean> {
    const value = await this.keyValueStore.getItem('showBodyweight');
    return value === 'True' || value === null || value === undefined;
  }

  async setShowTips(showTips: boolean): Promise<void> {
    await this.keyValueStore.setItem('showTips', showTips.toString());
  }

  async getShowTips(): Promise<boolean> {
    const value = await this.keyValueStore.getItem('showTips');
    return value === 'True' || value === null || value === undefined;
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
    await this.keyValueStore.setItem('showFeed', showFeed.toString());
  }

  async getShowFeed(): Promise<boolean> {
    const value = await this.keyValueStore.getItem('showFeed');
    return value === 'True' || value === null || value === undefined;
  }

  async getHasRequestedNotificationPermission(): Promise<boolean> {
    const value = await this.keyValueStore.getItem(
      'hasRequestedNotificationPermission',
    );
    return value === 'True';
  }

  async setHasRequestedNotificationPermission(
    hasRequested: boolean,
  ): Promise<void> {
    await this.keyValueStore.setItem(
      'hasRequestedNotificationPermission',
      hasRequested.toString(),
    );
  }

  async getAppOpenedCount(): Promise<number> {
    const value = await this.keyValueStore.getItem('appOpenedCount');
    const parsed = parseInt(value ?? '', 10);
    return isNaN(parsed) ? 0 : parsed;
  }

  async setAppOpenedCount(count: number): Promise<void> {
    await this.keyValueStore.setItem('appOpenedCount', count.toString());
  }

  async setAppRatingResult(result: AppRatingResult): Promise<void> {
    await this.keyValueStore.setItem('appRatingResult', result.toString());
  }

  async getAppRatingResult(): Promise<AppRatingResult> {
    const value = await this.keyValueStore.getItem('appRatingResult');
    if (
      value &&
      Object.values(AppRatingResult).includes(value as AppRatingResult)
    ) {
      return value as AppRatingResult;
    }
    return AppRatingResult.NotRated;
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
      includeFeedAccount: includeFeedAccount === 'True',
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
      settings.includeFeedAccount.toString(),
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
    await this.keyValueStore.setItem('backupReminder', showReminder.toString());
  }

  async getBackupReminder(): Promise<boolean> {
    const value = await this.keyValueStore.getItem('backupReminder');
    return value === 'True' || value === null || value === undefined;
  }

  async setSplitWeightByDefault(split: boolean): Promise<void> {
    await this.keyValueStore.setItem('splitWeightByDefault', split.toString());
  }

  async getSplitWeightByDefault(): Promise<boolean> {
    const value = await this.keyValueStore.getItem('splitWeightByDefault');
    return value === 'True';
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
}
