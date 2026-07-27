import { KeyValueStore } from '@/services/key-value-store';
import { boolCodec, instantCodec } from '@/store/settings/codecs';
import {
  PrefDescriptor,
  preferenceRegistry,
  PrefKey,
  PrefValue,
  RemoteBackupSettings,
} from '@/store/settings/registry';
import { Instant } from '@js-joda/core';

export type { RemoteBackupSettings } from '@/store/settings/registry';

export class PreferenceService {
  constructor(private keyValueStore: KeyValueStore) {}

  async getPreference<K extends PrefKey>(key: K): Promise<PrefValue<K>> {
    const descriptor = preferenceRegistry[key] as PrefDescriptor<PrefValue<K>>;
    const storageKey = descriptor.storageKey ?? key;
    if (!descriptor.codec) {
      return descriptor.default;
    }
    const raw = descriptor.sync
      ? this.keyValueStore.getItemSync(storageKey)
      : await this.keyValueStore.getItem(storageKey);
    return descriptor.codec.deserialize(raw) ?? descriptor.default;
  }

  async setPreference<K extends PrefKey>(key: K, value: PrefValue<K>): Promise<void> {
    const descriptor = preferenceRegistry[key] as PrefDescriptor<PrefValue<K>>;
    if (!descriptor.codec) {
      return;
    }
    const storageKey = descriptor.storageKey ?? key;
    const serialized = descriptor.codec.serialize(value);
    if (serialized === undefined) {
      await this.keyValueStore.removeItem(storageKey);
    } else {
      await this.keyValueStore.setItem(storageKey, serialized);
    }
  }

  getUseImperialUnits(): Promise<boolean> {
    return this.getPreference('useImperialUnits');
  }

  getProToken(): Promise<string | undefined> {
    return this.getPreference('proToken');
  }

  async setProToken(token?: string): Promise<void> {
    if (__DEV__) {
      return;
    }
    if (token) await this.keyValueStore.setItem('proToken', token);
  }

  // Sync so it can be read before the store exists (Tolgee bootstrap). Rewrites
  // the legacy `zh_Hans` value to the current `zh-hans` code on read.
  getPreferredLanguage(): string | undefined {
    const lang = this.keyValueStore.getItemSync('preferredLanguage');
    if (lang === 'zh_Hans') {
      void this.keyValueStore.setItem('preferredLanguage', 'zh-hans');
      return 'zh-hans';
    }
    return lang;
  }

  setPreferredLanguage(lang: string | undefined): Promise<void> {
    return lang
      ? this.keyValueStore.setItem('preferredLanguage', lang)
      : this.keyValueStore.removeItem('preferredLanguage');
  }

  // One field spread across three storage keys.
  async getRemoteBackupSettings(): Promise<RemoteBackupSettings> {
    const [endpoint, apiKey, includeFeedAccount] = await Promise.all([
      this.keyValueStore.getItem('remoteBackupSettings.Endpoint'),
      this.keyValueStore.getItem('remoteBackupSettings.ApiKey'),
      this.keyValueStore.getItem('remoteBackupSettings.IncludeFeedAccount'),
    ]);
    return {
      endpoint: endpoint ?? '',
      apiKey: apiKey ?? '',
      includeFeedAccount: boolCodec.deserialize(includeFeedAccount) ?? false,
    };
  }

  async setRemoteBackupSettings(settings: RemoteBackupSettings): Promise<void> {
    await this.keyValueStore.setItem('remoteBackupSettings.Endpoint', settings.endpoint);
    await this.keyValueStore.setItem('remoteBackupSettings.ApiKey', settings.apiKey);
    await this.keyValueStore.setItem(
      'remoteBackupSettings.IncludeFeedAccount',
      boolCodec.serialize(settings.includeFeedAccount)!,
    );
  }

  setLastSuccessfulRemoteBackupHash(hash: string): Promise<void> {
    return this.keyValueStore.setItem('lastSuccessfulRemoteBackupHash', hash);
  }

  async getLastSuccessfulRemoteBackupHash(): Promise<string | undefined> {
    return (await this.keyValueStore.getItem('lastSuccessfulRemoteBackupHash')) ?? undefined;
  }

  setLastBackupTime(time: Instant): Promise<void> {
    return this.keyValueStore.setItem('lastBackupTime', instantCodec.serialize(time)!);
  }

  async getLastBackupTime(): Promise<Instant> {
    const value = await this.keyValueStore.getItem('lastBackupTime');
    const parsed = instantCodec.deserialize(value);
    if (parsed) {
      return parsed;
    }
    const now = Instant.now();
    await this.setLastBackupTime(now);
    return now;
  }
}
