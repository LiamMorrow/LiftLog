import { describe, expect, it, vi } from 'vitest';
import { combineReducers } from '@reduxjs/toolkit';
import { Instant } from '@js-joda/core';
import { createAddEffectTestBed } from '@/utils/__test__/add-effect-testbed';
import { createTestDb } from '@/utils/__test__/test-db';
import { addRotationEffects } from '@/store/feed/rotation-effects';
import feedReducer, {
  flushOutbox,
  putFriends,
  removeFriends,
  rotateFeedKey,
  setIdentity,
  updateFeedIdentity,
} from '@/store/feed';
import { FeedIdentity, FEED_EVENT_RETENTION_DAYS, Friend, PreviousAesKey } from '@/models/feed-models';
import { RemoteData } from '@/models/remote';
import { AesKey } from '@/models/encryption-models';
import { InboxRecipient } from '@/services/feed-follow-service';
import { enqueueOutboxMessages, OutboxMessage } from '@/db/feed-outbox';
import { feedIdentitySchema, feedOutboxSchema } from '@/db/schema';
import { feedIdentityMigrations } from '@/models/storage/versions/migrations';
import { makeFriend } from '@/store/feed/__test__/friends';
import { identity, outboxRows } from '@/store/feed/__test__/inbox-harness';

const DAY_SECONDS = 24 * 60 * 60;

async function makeTestBed(options: { friends?: Friend[]; identity?: FeedIdentity } = {}) {
  let nextKey = 100;
  const services = {
    encryptionService: {
      generateAesKey: vi.fn(() =>
        Promise.resolve<AesKey>({ value: new Uint8Array([nextKey++]), algorithm: 'AES-GCM' }),
      ),
    },
    feedFollowService: {
      friendKeysMessage: vi.fn((_: FeedIdentity, recipient: InboxRecipient, _secret: string) =>
        Promise.resolve<OutboxMessage>({
          messageId: `keys-${recipient.id}-${Math.random()}`,
          recipientId: recipient.id,
          type: 'FriendKeys',
          encryptedMessage: [],
        }),
      ),
    },
  };
  const db = await createTestDb();
  const testBed = createAddEffectTestBed({
    initialState: {
      feed: {
        identity: RemoteData.success(options.identity ?? identity),
        friends: Object.fromEntries((options.friends ?? []).map((x) => [x.id, x])),
      },
    },
    services: { ...services, db },
    reducer: combineReducers({ feed: feedReducer }),
  });
  addRotationEffects(testBed.addEffect);

  const stored = () => {
    const row = db.select().from(feedIdentitySchema).all()[0];
    return row ? FeedIdentity.fromJSON(feedIdentityMigrations.migrate(row.payload)) : undefined;
  };
  const current = () => testBed.getState().feed.identity.unwrapOr(undefined)!;
  return { testBed, services, db, stored, current };
}

const rotate = (testBed: Awaited<ReturnType<typeof makeTestBed>>['testBed']) =>
  testBed.dispatchHandled(rotateFeedKey());

describe('rotateFeedKey', () => {
  it('stores the new key and tells everyone who holds the old one', async () => {
    const bed = await makeTestBed({
      friends: [
        makeFriend('bob'),
        makeFriend('carol', { status: 'legacyFollower' }),
        makeFriend('dave', { status: 'pending', mySecret: undefined }),
        makeFriend('erin', { status: 'incoming', mySecret: undefined }),
      ],
    });

    await rotate(bed.testBed);

    expect(bed.current().aesKey.value).toEqual(new Uint8Array([100]));
    expect(bed.current().previousAesKeys.map((x) => x.key)).toEqual([identity.aesKey]);
    expect(bed.stored()?.aesKey.value).toEqual(new Uint8Array([100]));
    expect(bed.stored()?.previousAesKeys.map((x) => x.key.value)).toEqual([identity.aesKey.value]);
    expect(outboxRows(bed.db)).toEqual([
      ['bob', 'FriendKeys'],
      ['carol', 'FriendKeys'],
    ]);
    const [sharedFrom, recipient, secret] = bed.services.feedFollowService.friendKeysMessage.mock.calls[0]!;
    expect(sharedFrom.aesKey.value).toEqual(new Uint8Array([100]));
    expect(recipient.id).toBe('bob');
    expect(secret).toBe('my-secret-bob');
  });

  it('moves an AES-CBC identity onto a default key and keeps the CBC key for older items', async () => {
    const cbcKey: AesKey = { value: new Uint8Array([5]), algorithm: 'AES-CBC' };
    const bed = await makeTestBed({ identity: identity.with({ aesKey: cbcKey }) });

    await rotate(bed.testBed);

    expect(bed.services.encryptionService.generateAesKey).toHaveBeenCalledWith();
    expect(bed.stored()?.aesKey.algorithm).toBe('AES-GCM');
    expect(bed.stored()?.previousAesKeys.map((x) => x.key.algorithm)).toEqual(['AES-CBC']);
    expect(bed.stored()?.previousAesKeys.map((x) => x.key.value)).toEqual([cbcKey.value]);
  });

  it('commits locally before republishing the profile, so a failed publish cannot lose the key', async () => {
    const bed = await makeTestBed({ friends: [makeFriend('bob')] });

    await rotate(bed.testBed);

    const types = bed.testBed.dispatchedActions.map((x) => x.type);
    expect(types).toEqual([setIdentity.type, updateFeedIdentity.type, flushOutbox.type]);
    expect(bed.testBed.getDispatchedAction(updateFeedIdentity).payload).toEqual({
      updates: {},
      fromUserAction: false,
    });
  });

  it('replaces keys still waiting to send rather than queueing more', async () => {
    const bed = await makeTestBed({ friends: [makeFriend('bob')] });
    enqueueOutboxMessages(bed.db, [
      { messageId: 'stale-keys', recipientId: 'bob', type: 'FriendKeys', encryptedMessage: [] },
      { messageId: 'cheer', recipientId: 'bob', type: 'Reaction', encryptedMessage: [] },
    ]);

    await rotate(bed.testBed);
    await rotate(bed.testBed);

    const rows = bed.db.select().from(feedOutboxSchema).all();
    expect(rows.map((x) => x.type)).toEqual(['Reaction', 'FriendKeys']);
    expect(rows[1]!.messageId).not.toBe('stale-keys');
  });

  it('shares the new key with someone who gained the old one while it was being prepared', async () => {
    const bed = await makeTestBed({ friends: [makeFriend('bob')] });
    const build = bed.services.feedFollowService.friendKeysMessage.getMockImplementation()!;
    bed.services.feedFollowService.friendKeysMessage.mockImplementationOnce((...args) => {
      bed.testBed.dispatch(putFriends([makeFriend('carol')]));
      return build(...args);
    });

    await rotate(bed.testBed);

    expect(outboxRows(bed.db)).toEqual([
      ['bob', 'FriendKeys'],
      ['carol', 'FriendKeys'],
    ]);
  });

  it('leaves out someone removed while it was being prepared', async () => {
    const bed = await makeTestBed({ friends: [makeFriend('bob'), makeFriend('carol')] });
    const build = bed.services.feedFollowService.friendKeysMessage.getMockImplementation()!;
    bed.services.feedFollowService.friendKeysMessage.mockImplementationOnce((...args) => {
      bed.testBed.dispatch(removeFriends(['carol']));
      return build(...args);
    });

    await rotate(bed.testBed);

    expect(outboxRows(bed.db)).toEqual([['bob', 'FriendKeys']]);
  });

  it('forgets previous keys superseded longer ago than events are kept', async () => {
    const now = Instant.now();
    const recent: PreviousAesKey = {
      key: { value: new Uint8Array([8]), algorithm: 'AES-GCM' },
      supersededAt: now.minusSeconds(10 * DAY_SECONDS),
    };
    const expired: PreviousAesKey = {
      key: { value: new Uint8Array([9]), algorithm: 'AES-GCM' },
      supersededAt: now.minusSeconds((FEED_EVENT_RETENTION_DAYS + 1) * DAY_SECONDS),
    };
    const bed = await makeTestBed({ identity: identity.with({ previousAesKeys: [recent, expired] }) });

    await rotate(bed.testBed);

    expect(bed.current().previousAesKeys.map((x) => x.key)).toEqual([identity.aesKey, recent.key]);
  });

  it('runs one rotation at a time, and rotates once more if asked while busy', async () => {
    const bed = await makeTestBed();
    let release!: () => void;
    bed.services.encryptionService.generateAesKey.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          release = () => resolve({ value: new Uint8Array([50]), algorithm: 'AES-GCM' });
        }),
    );

    const first = rotate(bed.testBed);
    await rotate(bed.testBed);
    await rotate(bed.testBed);
    release();
    await first;

    expect(bed.services.encryptionService.generateAesKey).toHaveBeenCalledTimes(2);
    expect(bed.current().previousAesKeys.map((x) => x.key.value)).toEqual([
      new Uint8Array([50]),
      identity.aesKey.value,
    ]);
  });

  it('abandons the rotation when the account is replaced mid-way', async () => {
    const bed = await makeTestBed({ friends: [makeFriend('bob')] });
    const replacement = identity.with({ id: 'someone-else' });
    bed.services.encryptionService.generateAesKey.mockImplementationOnce(() => {
      bed.testBed.dispatch(setIdentity(RemoteData.success(replacement)));
      return Promise.resolve({ value: new Uint8Array([50]), algorithm: 'AES-GCM' });
    });

    await rotate(bed.testBed);

    expect(bed.current()).toBe(replacement);
    expect(bed.stored()).toBeUndefined();
    expect(outboxRows(bed.db)).toEqual([]);
  });
});
