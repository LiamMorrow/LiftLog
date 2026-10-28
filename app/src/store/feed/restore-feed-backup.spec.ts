import { describe, expect, it, vi } from 'vitest';
import { combineReducers } from '@reduxjs/toolkit';
import { createAddEffectTestBed } from '@/utils/__test__/add-effect-testbed';
import { createTestDb } from '@/utils/__test__/test-db';
import { applyFeedEffects } from '@/store/feed/effects';
import feedReducer, { initializeFeedStateSlice, restoreFeedBackup } from '@/store/feed';
import { FeedIdentity } from '@/models/feed-models';
import { RemoteData } from '@/models/remote';
import { ApiResult } from '@/services/api-error';
import { InboxRecipient } from '@/services/feed-follow-service';
import { OutboxMessage } from '@/db/feed-outbox';
import { feedIdentitySchema } from '@/db/schema';
import { readFriends } from '@/db/feed-friends';
import { feedIdentityMigrations } from '@/models/storage/versions/migrations';
import { makeFriend } from '@/store/feed/__test__/friends';
import { identity, outboxRows } from '@/store/feed/__test__/inbox-harness';

const message = (type: OutboxMessage['type']) => (_: FeedIdentity, recipient: InboxRecipient) =>
  Promise.resolve<OutboxMessage>({
    messageId: `${type}-${recipient.id}`,
    recipientId: recipient.id,
    type,
    encryptedMessage: [],
  });

async function makeTestBed(current: FeedIdentity) {
  const services = {
    encryptionService: {
      generateAesKey: vi.fn(() => Promise.resolve({ value: new Uint8Array([100]) })),
    },
    feedIdentityService: {
      deleteFeedIdentityAsync: vi.fn(() => Promise.resolve(ApiResult.success())),
    },
    feedFollowService: {
      friendRequestMessage: vi.fn(message('FriendRequest')),
      friendKeysMessage: vi.fn(message('FriendKeys')),
    },
  };
  const db = await createTestDb();
  const testBed = createAddEffectTestBed({
    initialState: { feed: { identity: RemoteData.success(current) } },
    services: { ...services, db },
    reducer: combineReducers({ feed: feedReducer }),
  });
  applyFeedEffects(testBed.addEffect);
  return { testBed, services, db };
}

const friends = [
  makeFriend('bob'),
  makeFriend('carol', { status: 'legacyFollower' }),
  makeFriend('dave', { status: 'pending', mySecret: undefined }),
  makeFriend('erin', { status: 'incoming', mySecret: undefined }),
];

describe('restoreFeedBackup', () => {
  it('rotates the restored key, re-handshakes with friends, and tells key holders the new key', async () => {
    const bed = await makeTestBed(identity);

    await bed.testBed.dispatchHandled(restoreFeedBackup({ identity, feedItems: [], friends, fromUserAction: true }));

    const row = bed.db.select().from(feedIdentitySchema).all()[0]!;
    const stored = FeedIdentity.fromJSON(feedIdentityMigrations.migrate(row.payload));
    expect(stored.aesKey.value).toEqual(new Uint8Array([100]));
    expect(stored.previousAesKeys.map((x) => x.key.value)).toEqual([identity.aesKey.value]);
    expect(outboxRows(bed.db)).toEqual([
      ['bob', 'FriendRequest'],
      ['dave', 'FriendRequest'],
      ['bob', 'FriendKeys'],
      ['carol', 'FriendKeys'],
    ]);
    const sharedFrom = bed.services.feedFollowService.friendKeysMessage.mock.calls.map(([x]) => x.aesKey.value);
    expect(sharedFrom).toEqual([new Uint8Array([100]), new Uint8Array([100])]);
    expect(readFriends(bed.db).map((x) => x.id)).toEqual(['bob', 'carol', 'dave', 'erin']);
    bed.testBed.getDispatchedAction(initializeFeedStateSlice);
  });

  it('keeps the account on the server when restoring that same account', async () => {
    const bed = await makeTestBed(identity);

    await bed.testBed.dispatchHandled(restoreFeedBackup({ identity, feedItems: [], friends, fromUserAction: true }));

    expect(bed.services.feedIdentityService.deleteFeedIdentityAsync).not.toHaveBeenCalled();
  });

  it('deletes the current account when restoring a different one', async () => {
    const current = identity.with({ id: 'current' });
    const bed = await makeTestBed(current);

    await bed.testBed.dispatchHandled(restoreFeedBackup({ identity, feedItems: [], friends, fromUserAction: true }));

    expect(bed.services.feedIdentityService.deleteFeedIdentityAsync).toHaveBeenCalledWith(current);
  });
});
