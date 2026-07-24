import { describe, it, expect } from 'vitest';
import {
  selectHasUnseenWhatsNew,
  selectUnseenWhatsNew,
  setLastSeenWhatsNewId,
  settingsReducer,
} from '@/store/settings';
import { latestWhatsNewId, whatsNewEntries } from '@/models/whats-new';
import { RootState } from '@/store';

const stateWith = (settings: Partial<ReturnType<typeof settingsReducer>>) =>
  ({
    settings: { ...settingsReducer(undefined, { type: '@@INIT' }), ...settings },
  }) as RootState;

describe('whats-new selectors', () => {
  it('flags every entry unseen for a user who has never seen the list', () => {
    const state = stateWith({ lastSeenWhatsNewId: 0 });
    expect(selectHasUnseenWhatsNew(state)).toBe(whatsNewEntries.length > 0);
    expect(selectUnseenWhatsNew(state)).toEqual(whatsNewEntries.filter((e) => e.condition?.(state) ?? true));
  });

  it('reports nothing unseen once the latest id is acknowledged', () => {
    const state = stateWith({ lastSeenWhatsNewId: latestWhatsNewId });
    expect(selectHasUnseenWhatsNew(state)).toBe(false);
    expect(selectUnseenWhatsNew(state)).toEqual([]);
  });

  it('only surfaces entries newer than the last seen id', () => {
    const state = stateWith({ lastSeenWhatsNewId: latestWhatsNewId - 1 });
    expect(selectUnseenWhatsNew(state)).toEqual(whatsNewEntries.filter((e) => e.id === latestWhatsNewId));
  });

  it('hides an entry whose condition is not met', () => {
    const enabled = stateWith({ lastSeenWhatsNewId: 0, exportToHealthAggregator: true });
    const disabled = stateWith({ lastSeenWhatsNewId: 0, exportToHealthAggregator: false });
    expect(selectUnseenWhatsNew(enabled).length).toBeLessThan(selectUnseenWhatsNew(disabled).length);
    expect(selectUnseenWhatsNew(enabled).every((e) => e.condition?.(enabled) ?? true)).toBe(true);
  });

  it('acknowledging the latest id via the reducer clears the flag', () => {
    const acknowledged = settingsReducer(
      settingsReducer(undefined, { type: '@@INIT' }),
      setLastSeenWhatsNewId(latestWhatsNewId),
    );
    expect(acknowledged.lastSeenWhatsNewId).toBe(latestWhatsNewId);
  });
});
