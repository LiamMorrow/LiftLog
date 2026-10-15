import { describe, it, expect, vi } from 'vitest';
import { createAddEffectTestBed } from '@/utils/__test__/add-effect-testbed';
import { applyFeedEffects } from '@/store/feed/effects';
import feedReducer, { clearFeedState, createFeedIdentity, resetFeedAccount, setIdentity } from '@/store/feed';
import { combineReducers } from '@reduxjs/toolkit';
import { createTestDb } from '@/utils/__test__/test-db';
import { enqueueOutboxMessages } from '@/db/feed-outbox';
import {
  feedInboxSeenSchema,
  feedOutboxSchema,
  feedRevokedFollowSecretsSchema,
  feedUnpublishedSessionsSchema,
} from '@/db/schema';
import { setBackendAssignment, switchFeedBackend } from '@/store/backends';
import { FeedIdentity } from '@/models/feed-models';
import { RemoteData } from '@/models/remote';
import { ApiResult, ApiErrorType } from '@/services/api-error';

function makeIdentity(): FeedIdentity {
  return new FeedIdentity(
    'user-id',
    'lookup',
    { value: new Uint8Array([1]), algorithm: 'AES-GCM' },
    {
      publicKey: { spkiPublicKeyBytes: new Uint8Array([2]) },
      privateKey: { pkcs8PrivateKeyBytes: new Uint8Array([3]) },
    },
    'password',
    'Liam',
    true,
    true,
    true,
  );
}

function makeTestBed(identity: FeedIdentity | undefined, deleteResult = ApiResult.success()) {
  const feedIdentityService = { deleteFeedIdentityAsync: vi.fn().mockResolvedValue(deleteResult) };
  const testBed = createAddEffectTestBed({
    initialState: {
      feed: { identity: identity ? RemoteData.success(identity) : RemoteData.notAsked() },
    },
    services: { feedIdentityService, logger: { warn: vi.fn(), info: vi.fn() } },
  });
  applyFeedEffects(testBed.addEffect);
  return { testBed, feedIdentityService };
}

describe('switchFeedBackend', () => {
  it('deletes the account on the old server, wipes local feed data, then repoints', async () => {
    const identity = makeIdentity();
    const { testBed, feedIdentityService } = makeTestBed(identity);

    await testBed.dispatchHandled(switchFeedBackend({ backendId: 'self' }));

    expect(feedIdentityService.deleteFeedIdentityAsync).toHaveBeenCalledWith(identity);
    expect(testBed.dispatchedActions.map((x) => x.type)).toEqual([
      clearFeedState.type,
      setBackendAssignment.type,
      createFeedIdentity.type,
    ]);
    expect(testBed.getDispatchedAction(setBackendAssignment).payload).toEqual({
      feature: 'feed',
      backendId: 'self',
    });
  });

  // A server we can no longer reach must not strand the user on it.
  it('still switches when the old server cannot be reached', async () => {
    const { testBed } = makeTestBed(
      makeIdentity(),
      ApiResult.fromError({ type: ApiErrorType.Unknown, message: 'offline', exception: undefined }),
    );

    await testBed.dispatchHandled(switchFeedBackend({ backendId: 'self' }));

    expect(testBed.getDispatchedAction(setBackendAssignment).payload).toEqual({
      feature: 'feed',
      backendId: 'self',
    });
  });

  it('carries the profile onto the new account', async () => {
    const { testBed } = makeTestBed(makeIdentity());

    await testBed.dispatchHandled(switchFeedBackend({ backendId: 'self' }));

    expect(testBed.getDispatchedAction(createFeedIdentity).payload).toMatchObject({
      name: 'Liam',
      publishBodyweight: true,
      publishPlan: true,
      publishWorkouts: true,
    });
  });

  it('does not call the old server when there was no account', async () => {
    const { testBed, feedIdentityService } = makeTestBed(undefined);

    await testBed.dispatchHandled(switchFeedBackend({ backendId: 'self' }));

    expect(feedIdentityService.deleteFeedIdentityAsync).not.toHaveBeenCalled();
    expect(testBed.getDispatchedAction(setBackendAssignment)).toBeDefined();
  });
});

describe('clearFeedState', () => {
  it('wipes the stored feed account, keeping only sessions still waiting to be published', async () => {
    const db = await createTestDb();
    enqueueOutboxMessages(db, [{ messageId: 'm1', recipientId: 'u1', type: 'Reaction', encryptedMessage: [] }]);
    db.insert(feedRevokedFollowSecretsSchema).values({ secret: 'secret' }).run();
    db.insert(feedInboxSeenSchema).values({ messageId: 'seen', seenAtMs: 0 }).run();
    db.insert(feedUnpublishedSessionsSchema).values({ sessionId: 'session-1' }).run();
    const testBed = createAddEffectTestBed({ services: { db } });
    applyFeedEffects(testBed.addEffect);

    await testBed.dispatchHandled(clearFeedState());

    expect(db.select().from(feedOutboxSchema).all()).toEqual([]);
    expect(db.select().from(feedRevokedFollowSecretsSchema).all()).toEqual([]);
    expect(db.select().from(feedInboxSeenSchema).all()).toEqual([]);
    expect(db.select().from(feedUnpublishedSessionsSchema).all()).toEqual([{ sessionId: 'session-1' }]);
  });
});

describe('resetFeedAccount', () => {
  function makeResetTestBed() {
    const identity = makeIdentity();
    const feedIdentityService = { deleteFeedIdentityAsync: vi.fn().mockResolvedValue(ApiResult.success()) };
    const testBed = createAddEffectTestBed({
      initialState: { feed: { identity: RemoteData.success(identity) } },
      services: { feedIdentityService },
      reducer: combineReducers({ feed: feedReducer }),
    });
    applyFeedEffects(testBed.addEffect);
    return { testBed, feedIdentityService };
  }

  it('clears the account it deleted', async () => {
    const { testBed } = makeResetTestBed();

    await testBed.dispatchHandled(resetFeedAccount({ fromUserAction: true, createNewIdentity: false }));

    testBed.getDispatchedAction(clearFeedState);
  });

  it('leaves alone an account restored while the old one was being deleted', async () => {
    const { testBed, feedIdentityService } = makeResetTestBed();
    const restored = new FeedIdentity(
      'restored-id',
      'lookup',
      { value: new Uint8Array(), algorithm: 'AES-GCM' },
      makeIdentity().rsaKeyPair,
      'pw',
      'Liam',
      true,
      true,
      true,
    );
    feedIdentityService.deleteFeedIdentityAsync.mockImplementation(() => {
      testBed.dispatch(setIdentity(RemoteData.success(restored)));
      return Promise.resolve(ApiResult.success());
    });

    await testBed.dispatchHandled(resetFeedAccount({ fromUserAction: true, createNewIdentity: false }));

    testBed.expectNotDispatched(clearFeedState);
  });
});
