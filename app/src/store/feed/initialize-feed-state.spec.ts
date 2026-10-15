import { describe, it, vi } from 'vitest';
import { combineReducers } from '@reduxjs/toolkit';
import { createAddEffectTestBed } from '@/utils/__test__/add-effect-testbed';
import { createTestDb } from '@/utils/__test__/test-db';
import { applyFeedEffects } from '@/store/feed/effects';
import feedReducer, { initializeFeedStateSlice, rotateFeedKey, setIsHydrated } from '@/store/feed';
import { feedIdentitySchema } from '@/db/schema';
import { upsert } from '@/db/helpers';
import { identity } from '@/store/feed/__test__/inbox-harness';
import { FeedIdentityJSON } from '@/models/storage/versions/latest';

vi.mock('react-native', () => ({ Platform: { OS: 'android' } }));

async function initializeWith(payload: FeedIdentityJSON) {
  const db = await createTestDb();
  upsert(db, feedIdentitySchema, [{ id: 0, payload }]);
  const testBed = createAddEffectTestBed({
    services: { db },
    reducer: combineReducers({ feed: feedReducer }),
  });
  applyFeedEffects(testBed.addEffect);
  await testBed.dispatchHandled(initializeFeedStateSlice());
  testBed.getDispatchedAction(setIsHydrated);
  return testBed;
}

describe('initializeFeedStateSlice', () => {
  it('rotates an identity whose key was stored before keys recorded their algorithm', async () => {
    const { algorithm: _, ...legacyKey } = identity.toJSON().aesKey;

    const testBed = await initializeWith({ ...identity.toJSON(), aesKey: legacyKey });

    testBed.getDispatchedAction(rotateFeedKey);
  });

  it('leaves an AES-GCM identity alone', async () => {
    const testBed = await initializeWith(
      identity.with({ aesKey: { ...identity.aesKey, algorithm: 'AES-GCM' } }).toJSON(),
    );

    testBed.expectNotDispatched(rotateFeedKey);
  });
});
