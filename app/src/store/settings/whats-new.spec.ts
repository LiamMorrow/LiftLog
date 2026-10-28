import { describe, it, expect } from 'vitest';
import {
  selectHasUnseenWhatsNew,
  selectUnseenWhatsNew,
  setLastSeenWhatsNewId,
  settingsReducer,
} from '@/store/settings';
import programReducer from '@/store/program';
import { backendsReducer } from '@/store/backends';
import feedReducer from '@/store/feed';
import { FeedIdentity } from '@/models/feed-models';
import { RemoteData } from '@/models/remote';
import { makeFriend } from '@/store/feed/__test__/friends';
import { latestWhatsNewId, whatsNewEntries } from '@/models/whats-new';
import { RootState } from '@/store';

// Conditions read whatever slice their feature lives in, so every slice they can reach is built.
const stateWith = (
  settings: Partial<ReturnType<typeof settingsReducer>>,
  identity?: FeedIdentity,
  friends = identity ? { friend: makeFriend('friend') } : {},
) =>
  ({
    settings: { ...settingsReducer(undefined, { type: '@@INIT' }), ...settings },
    program: programReducer(undefined, { type: '@@INIT' }),
    backends: backendsReducer(undefined, { type: '@@INIT' }),
    feed: {
      ...feedReducer(undefined, { type: '@@INIT' }),
      identity: identity ? RemoteData.success(identity) : RemoteData.notAsked(),
      friends,
    },
  }) as RootState;

const identityWith = (shareLiveWorkouts: boolean) =>
  new FeedIdentity('me', 'lookup', {} as never, {} as never, 'pw', 'Me', false, false, true, [], shareLiveWorkouts);

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
    const state = stateWith({ lastSeenWhatsNewId: latestWhatsNewId - 1 }, identityWith(false));
    expect(selectUnseenWhatsNew(state)).toEqual(whatsNewEntries.filter((e) => e.id === latestWhatsNewId));
  });

  it('hides an entry whose condition is not met', () => {
    const enabled = stateWith({ lastSeenWhatsNewId: 0, exportToHealthAggregator: true });
    const disabled = stateWith({ lastSeenWhatsNewId: 0, exportToHealthAggregator: false });
    expect(selectUnseenWhatsNew(enabled).length).toBeLessThan(selectUnseenWhatsNew(disabled).length);
    expect(selectUnseenWhatsNew(enabled).every((e) => e.condition?.(enabled) ?? true)).toBe(true);
  });

  it('announces live workouts only to feed users with friends who have not turned them on', () => {
    const isLiveEntry = (e: (typeof whatsNewEntries)[number]) => e.titleKey === 'whats_new.live_workouts.title';
    const shown = (state: RootState) => selectUnseenWhatsNew(state).some(isLiveEntry);

    expect(shown(stateWith({ lastSeenWhatsNewId: 0 }, identityWith(false)))).toBe(true);
    expect(shown(stateWith({ lastSeenWhatsNewId: 0 }, identityWith(true)))).toBe(false);
    expect(shown(stateWith({ lastSeenWhatsNewId: 0 }, identityWith(false), {}))).toBe(false);
    expect(shown(stateWith({ lastSeenWhatsNewId: 0, showFeed: false }, identityWith(false)))).toBe(false);
    expect(shown(stateWith({ lastSeenWhatsNewId: 0 }))).toBe(false);
  });

  it('acknowledging the latest id via the reducer clears the flag', () => {
    const acknowledged = settingsReducer(
      settingsReducer(undefined, { type: '@@INIT' }),
      setLastSeenWhatsNewId(latestWhatsNewId),
    );
    expect(acknowledged.lastSeenWhatsNewId).toBe(latestWhatsNewId);
  });
});
