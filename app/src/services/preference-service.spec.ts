import { afterEach, describe, expect, it, vi } from 'vitest';
import { PreferenceService } from '@/services/preference-service';
import { KeyValueStore } from '@/services/key-value-store';
import { PrefKey } from '@/store/settings/registry';
import { DayOfWeek, Instant } from '@js-joda/core';

// Characterization tests pinning the exact value read for a missing key and for
// representative stored strings, and the exact string written back - asserted
// through the generic getPreference/setPreference and the bespoke named methods.
// This is the guarantee that the registry refactor never changes what a user's
// stored data means or loses it.

function makeKvStore(initial: Record<string, string> = {}) {
  const map = new Map<string, string>(Object.entries(initial));
  const store = {
    map,
    getItem: vi.fn((key: string) => Promise.resolve(map.has(key) ? map.get(key) : undefined)),
    getItemSync: vi.fn((key: string) => (map.has(key) ? map.get(key) : undefined)),
    getItemBytes: vi.fn(() => Promise.resolve(undefined)),
    setItem: vi.fn((key: string, value: string) => {
      map.set(key, value);
      return Promise.resolve();
    }),
    removeItem: vi.fn((key: string) => {
      map.delete(key);
      return Promise.resolve();
    }),
  };
  return store;
}

function makeService(initial: Record<string, string> = {}) {
  const store = makeKvStore(initial);
  const service = new PreferenceService(store as unknown as KeyValueStore);
  return { service, store };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

// ─── Boolean preferences ────────────────────────────────────────────────────

interface BoolPref {
  key: PrefKey;
  default: boolean;
}

const booleanPrefs: BoolPref[] = [
  { key: 'useImperialUnits', default: false },
  { key: 'showBodyweight', default: true },
  { key: 'showTips', default: true },
  { key: 'showFeed', default: true },
  { key: 'restNotifications', default: true },
  { key: 'restTimersEnabled', default: true },
  { key: 'crashReportsEnabled', default: true },
  { key: 'welcomeWizardCompleted', default: false },
  { key: 'notesExpandedByDefault', default: true },
  { key: 'keepScreenAwakeDuringWorkout', default: true },
  { key: 'exportToHealthAggregator', default: false },
  { key: 'showPostWorkoutSummary', default: false },
  { key: 'trueBlackDarkTheme', default: false },
  { key: 'backupReminder', default: true },
];

describe('PreferenceService - boolean preferences', () => {
  for (const pref of booleanPrefs) {
    describe(pref.key, () => {
      it(`defaults to ${pref.default} when unset`, async () => {
        const { service } = makeService();
        expect(await service.getPreference(pref.key)).toBe(pref.default);
      });

      it("reads 'True' as true and 'False' as false", async () => {
        expect(await makeService({ [pref.key]: 'True' }).service.getPreference(pref.key)).toBe(true);
        expect(await makeService({ [pref.key]: 'False' }).service.getPreference(pref.key)).toBe(false);
      });

      it("reads any non-'True' string as false", async () => {
        expect(await makeService({ [pref.key]: 'true' }).service.getPreference(pref.key)).toBe(false);
        expect(await makeService({ [pref.key]: 'garbage' }).service.getPreference(pref.key)).toBe(false);
      });

      it("writes 'True' / 'False' to the key", async () => {
        const { service, store } = makeService();
        await service.setPreference(pref.key, true);
        expect(store.setItem).toHaveBeenCalledWith(pref.key, 'True');
        await service.setPreference(pref.key, false);
        expect(store.setItem).toHaveBeenCalledWith(pref.key, 'False');
      });
    });
  }
});

// ─── Number preferences ───────────────────────────────────────────────────────

describe('PreferenceService - number preferences', () => {
  describe('tipToShow', () => {
    it('defaults to 1 when unset or unparseable', async () => {
      expect(await makeService().service.getPreference('tipToShow')).toBe(1);
      expect(await makeService({ tipToShow: 'abc' }).service.getPreference('tipToShow')).toBe(1);
    });

    it('reads and writes an integer string', async () => {
      expect(await makeService({ tipToShow: '5' }).service.getPreference('tipToShow')).toBe(5);
      const { service, store } = makeService();
      await service.setPreference('tipToShow', 3);
      expect(store.setItem).toHaveBeenCalledWith('tipToShow', '3');
    });
  });

  describe('lastSeenWhatsNewId', () => {
    it('defaults to 0 when unset or unparseable', async () => {
      expect(await makeService().service.getPreference('lastSeenWhatsNewId')).toBe(0);
      expect(await makeService({ lastSeenWhatsNewId: 'x' }).service.getPreference('lastSeenWhatsNewId')).toBe(0);
    });

    it('reads and writes an integer string', async () => {
      expect(await makeService({ lastSeenWhatsNewId: '7' }).service.getPreference('lastSeenWhatsNewId')).toBe(7);
      const { service, store } = makeService();
      await service.setPreference('lastSeenWhatsNewId', 2);
      expect(store.setItem).toHaveBeenCalledWith('lastSeenWhatsNewId', '2');
    });
  });
});

// ─── colorSchemeSeed ────────────────────────────────────────────────────────

describe('PreferenceService - colorSchemeSeed', () => {
  it("defaults to 'default' when unset", async () => {
    expect(await makeService().service.getPreference('colorSchemeSeed')).toBe('default');
  });

  it('reads a valid six-digit hex (either case) verbatim', async () => {
    expect(await makeService({ colorSchemeSeed: '#aabbcc' }).service.getPreference('colorSchemeSeed')).toBe('#aabbcc');
    expect(await makeService({ colorSchemeSeed: '#AABBCC' }).service.getPreference('colorSchemeSeed')).toBe('#AABBCC');
  });

  it("falls back to 'default' for anything not a six-digit hex", async () => {
    expect(await makeService({ colorSchemeSeed: 'default' }).service.getPreference('colorSchemeSeed')).toBe('default');
    expect(await makeService({ colorSchemeSeed: 'red' }).service.getPreference('colorSchemeSeed')).toBe('default');
    expect(await makeService({ colorSchemeSeed: '#xyz' }).service.getPreference('colorSchemeSeed')).toBe('default');
    expect(await makeService({ colorSchemeSeed: '#abc' }).service.getPreference('colorSchemeSeed')).toBe('default');
  });

  it('writes the value verbatim', async () => {
    const { service, store } = makeService();
    await service.setPreference('colorSchemeSeed', '#123456');
    expect(store.setItem).toHaveBeenCalledWith('colorSchemeSeed', '#123456');
    await service.setPreference('colorSchemeSeed', 'default');
    expect(store.setItem).toHaveBeenCalledWith('colorSchemeSeed', 'default');
  });
});

// ─── firstDayOfWeek ───────────────────────────────────────────────────────────

describe('PreferenceService - firstDayOfWeek', () => {
  const days: [string, DayOfWeek][] = [
    ['sunday', DayOfWeek.SUNDAY],
    ['monday', DayOfWeek.MONDAY],
    ['tuesday', DayOfWeek.TUESDAY],
    ['wednesday', DayOfWeek.WEDNESDAY],
    ['thursday', DayOfWeek.THURSDAY],
    ['friday', DayOfWeek.FRIDAY],
    ['saturday', DayOfWeek.SATURDAY],
  ];

  it('defaults to SUNDAY when unset or unknown', async () => {
    expect(await makeService().service.getPreference('firstDayOfWeek')).toBe(DayOfWeek.SUNDAY);
    expect(await makeService({ firstDayOfWeek: 'someday' }).service.getPreference('firstDayOfWeek')).toBe(
      DayOfWeek.SUNDAY,
    );
  });

  for (const [name, day] of days) {
    it(`reads '${name}' (case-insensitively) as ${day.toString()}`, async () => {
      expect(await makeService({ firstDayOfWeek: name }).service.getPreference('firstDayOfWeek')).toBe(day);
      expect(await makeService({ firstDayOfWeek: name.toUpperCase() }).service.getPreference('firstDayOfWeek')).toBe(
        day,
      );
    });
  }

  it('writes the DayOfWeek name', async () => {
    const { service, store } = makeService();
    await service.setPreference('firstDayOfWeek', DayOfWeek.MONDAY);
    expect(store.setItem).toHaveBeenCalledWith('firstDayOfWeek', 'MONDAY');
  });
});

// ─── proToken (has a __DEV__ write guard) ─────────────────────────────────────

describe('PreferenceService - proToken', () => {
  it('defaults to undefined and reads a stored token', async () => {
    expect(await makeService().service.getProToken()).toBeUndefined();
    expect(await makeService({ proToken: 'tok-123' }).service.getProToken()).toBe('tok-123');
  });

  it('does not write in __DEV__', async () => {
    vi.stubGlobal('__DEV__', true);
    const { service, store } = makeService();
    await service.setProToken('tok-123');
    expect(store.setItem).not.toHaveBeenCalled();
  });

  it('writes a truthy token outside __DEV__', async () => {
    vi.stubGlobal('__DEV__', false);
    const { service, store } = makeService();
    await service.setProToken('tok-123');
    expect(store.setItem).toHaveBeenCalledWith('proToken', 'tok-123');
  });

  it('does not write an undefined token outside __DEV__', async () => {
    vi.stubGlobal('__DEV__', false);
    const { service, store } = makeService();
    await service.setProToken(undefined);
    expect(store.setItem).not.toHaveBeenCalled();
  });
});

// ─── preferredLanguage (sync, legacy rewrite, remove-on-undefined) ────────────

describe('PreferenceService - preferredLanguage', () => {
  it('defaults to undefined and reads a stored code', () => {
    expect(makeService().service.getPreferredLanguage()).toBeUndefined();
    expect(makeService({ preferredLanguage: 'en' }).service.getPreferredLanguage()).toBe('en');
  });

  it("rewrites legacy 'zh_Hans' to 'zh-hans' on read", () => {
    const { service, store } = makeService({ preferredLanguage: 'zh_Hans' });
    expect(service.getPreferredLanguage()).toBe('zh-hans');
    expect(store.setItem).toHaveBeenCalledWith('preferredLanguage', 'zh-hans');
  });

  it('writes a code and removes the key when cleared', async () => {
    const { service, store } = makeService();
    await service.setPreferredLanguage('fr');
    expect(store.setItem).toHaveBeenCalledWith('preferredLanguage', 'fr');
    await service.setPreferredLanguage(undefined);
    expect(store.removeItem).toHaveBeenCalledWith('preferredLanguage');
  });
});

// ─── remoteBackupSettings (one field ↔ three keys) ────────────────────────────

describe('PreferenceService - remoteBackupSettings', () => {
  it('defaults to empty settings when unset', async () => {
    expect(await makeService().service.getRemoteBackupSettings()).toEqual({
      endpoint: '',
      apiKey: '',
      includeFeedAccount: false,
    });
  });

  it('reads the three composite keys', async () => {
    const { service } = makeService({
      'remoteBackupSettings.Endpoint': 'https://example.com',
      'remoteBackupSettings.ApiKey': 'secret',
      'remoteBackupSettings.IncludeFeedAccount': 'True',
    });
    expect(await service.getRemoteBackupSettings()).toEqual({
      endpoint: 'https://example.com',
      apiKey: 'secret',
      includeFeedAccount: true,
    });
  });

  it('writes the three composite keys', async () => {
    const { service, store } = makeService();
    await service.setRemoteBackupSettings({ endpoint: 'https://e', apiKey: 'k', includeFeedAccount: true });
    expect(store.setItem).toHaveBeenCalledWith('remoteBackupSettings.Endpoint', 'https://e');
    expect(store.setItem).toHaveBeenCalledWith('remoteBackupSettings.ApiKey', 'k');
    expect(store.setItem).toHaveBeenCalledWith('remoteBackupSettings.IncludeFeedAccount', 'True');
  });
});

// ─── lastBackup bookkeeping ───────────────────────────────────────────────────

describe('PreferenceService - last backup bookkeeping', () => {
  it('lastSuccessfulRemoteBackupHash defaults to undefined and round-trips', async () => {
    expect(await makeService().service.getLastSuccessfulRemoteBackupHash()).toBeUndefined();
    expect(
      await makeService({ lastSuccessfulRemoteBackupHash: 'abc' }).service.getLastSuccessfulRemoteBackupHash(),
    ).toBe('abc');
    const { service, store } = makeService();
    await service.setLastSuccessfulRemoteBackupHash('h');
    expect(store.setItem).toHaveBeenCalledWith('lastSuccessfulRemoteBackupHash', 'h');
  });

  it('lastBackupTime reads a stored ISO instant verbatim', async () => {
    const iso = '2024-01-02T03:04:05Z';
    const { service } = makeService({ lastBackupTime: iso });
    expect((await service.getLastBackupTime()).equals(Instant.parse(iso))).toBe(true);
  });

  it('lastBackupTime persists a fresh now when unset', async () => {
    const { service, store } = makeService();
    const result = await service.getLastBackupTime();
    expect(store.setItem).toHaveBeenCalledWith('lastBackupTime', result.toString());
  });

  it('lastBackupTime persists a fresh now when the stored value is unparseable', async () => {
    const { service, store } = makeService({ lastBackupTime: 'not-an-instant' });
    const result = await service.getLastBackupTime();
    expect(store.setItem).toHaveBeenCalledWith('lastBackupTime', result.toString());
  });

  it('writes an instant via toString', async () => {
    const { service, store } = makeService();
    const instant = Instant.parse('2024-05-06T07:08:09Z');
    await service.setLastBackupTime(instant);
    expect(store.setItem).toHaveBeenCalledWith('lastBackupTime', instant.toString());
  });
});
