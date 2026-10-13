import { describe, expect, it } from 'vitest';
import { Instant } from '@js-joda/core';
import {
  acceptFriendRequest,
  denyFriendRequest,
  feedApiError,
  fetchInboxItems,
  rejectLegacyFollowRequests,
  removeFriend,
  repairFriends,
  requestFriend,
  revokeFollowSecrets,
  rotateFeedKey,
  setIdentity,
  shareBackWithFriend,
} from '@/store/feed';
import { RemoteData } from '@/models/remote';
import { ApiErrorType, ApiResult } from '@/services/api-error';
import { feedFollowRequestsSchema, feedRevokedFollowSecretsSchema } from '@/db/schema';
import { readFriends } from '@/db/feed-friends';
import { enqueueOutboxMessages } from '@/db/feed-outbox';
import { readFriendRepairs, writeFriendRepairs } from '@/db/feed-friend-repair';
import { addRepairEffects } from '@/store/feed/repair-effects';
import { makeFriend } from '@/store/feed/__test__/friends';
import {
  deliver,
  identity,
  inbox,
  InboxTestBed,
  makeInboxTestBed,
  outboxRows,
} from '@/store/feed/__test__/inbox-harness';

const poll = (testBed: InboxTestBed['testBed']) => testBed.dispatchHandled(fetchInboxItems({ fromUserAction: false }));
const friend = (testBed: InboxTestBed['testBed'], id: string) => testBed.getState().feed.friends[id];
const sharedUser = (id: string) => ({ id, publicKey: { spkiPublicKeyBytes: new Uint8Array([1]) }, name: `name-${id}` });
const rotations = (bed: InboxTestBed) => bed.testBed.dispatchedActions.filter(rotateFeedKey.match).length;
const revoked = (bed: InboxTestBed) =>
  bed.db
    .select()
    .from(feedRevokedFollowSecretsSchema)
    .all()
    .map((x) => x.secret);

describe('friend actions', () => {
  it('asks to be friends without sharing any keys yet', async () => {
    const bed = await makeInboxTestBed();

    await bed.testBed.dispatchHandled(requestFriend({ user: sharedUser('bob'), fromUserAction: true }));

    expect(friend(bed.testBed, 'bob')?.status).toBe('pending');
    expect(friend(bed.testBed, 'bob')?.mySecret).toBeUndefined();
    expect(outboxRows(bed.db)).toEqual([['bob', 'FriendRequest']]);
    expect(bed.services.feedFollowService.issueFollowSecretAsync).not.toHaveBeenCalled();
    expect(readFriends(bed.db).map((x) => x.id)).toEqual(['bob']);
  });

  it('ignores your own link', async () => {
    const bed = await makeInboxTestBed();

    await bed.testBed.dispatchHandled(requestFriend({ user: sharedUser(identity.id), fromUserAction: true }));

    expect(bed.testBed.getState().feed.friends).toEqual({});
    expect(outboxRows(bed.db)).toEqual([]);
  });

  it('accepts instead when the person on the link has already asked', async () => {
    const bed = await makeInboxTestBed({ friends: [makeFriend('bob', { status: 'incoming', mySecret: undefined })] });

    await bed.testBed.dispatchHandled(requestFriend({ user: sharedUser('bob'), fromUserAction: true }));

    expect(bed.testBed.getDispatchedAction(acceptFriendRequest).payload.friendId).toBe('bob');
    expect(outboxRows(bed.db)).toEqual([]);
  });

  it('does nothing for someone who is already a friend', async () => {
    const bed = await makeInboxTestBed({ friends: [makeFriend('bob')] });

    await bed.testBed.dispatchHandled(requestFriend({ user: sharedUser('bob'), fromUserAction: true }));

    expect(outboxRows(bed.db)).toEqual([]);
  });

  it('accepting issues a secret and shares keys', async () => {
    const bed = await makeInboxTestBed({ friends: [makeFriend('alice', { status: 'incoming', mySecret: undefined })] });

    await bed.testBed.dispatchHandled(acceptFriendRequest({ friendId: 'alice', fromUserAction: true }));

    expect(friend(bed.testBed, 'alice')?.status).toBe('friend');
    expect(friend(bed.testBed, 'alice')?.mySecret).toMatch(/^issued-/);
    expect(outboxRows(bed.db)).toEqual([['alice', 'FriendKeys']]);
  });

  it('leaves the request alone when a secret cannot be issued', async () => {
    const bed = await makeInboxTestBed({ friends: [makeFriend('alice', { status: 'incoming', mySecret: undefined })] });
    bed.services.feedFollowService.issueFollowSecretAsync.mockResolvedValue(
      ApiResult.fromError({ type: ApiErrorType.Unknown, message: 'offline', exception: undefined }),
    );

    await bed.testBed.dispatchHandled(acceptFriendRequest({ friendId: 'alice', fromUserAction: true }));

    expect(friend(bed.testBed, 'alice')?.status).toBe('incoming');
    expect(outboxRows(bed.db)).toEqual([]);
    bed.testBed.getDispatchedAction(feedApiError);
  });

  it('denying removes the request and tells them', async () => {
    const bed = await makeInboxTestBed({ friends: [makeFriend('alice', { status: 'incoming', mySecret: undefined })] });

    await bed.testBed.dispatchHandled(denyFriendRequest({ friendId: 'alice', fromUserAction: true }));

    expect(bed.testBed.getDispatchedAction(removeFriend).payload).toMatchObject({ friendId: 'alice', notify: true });
  });

  it('removing a request we received sends a rejection rather than an unfriend', async () => {
    const bed = await makeInboxTestBed({ friends: [makeFriend('alice', { status: 'incoming', mySecret: undefined })] });

    await bed.testBed.dispatchHandled(removeFriend({ friendId: 'alice', notify: true, fromUserAction: true }));

    expect(friend(bed.testBed, 'alice')).toBeUndefined();
    expect(outboxRows(bed.db)).toEqual([['alice', 'FriendReject']]);
  });

  it('cancelling a request leaves only the cancellation queued', async () => {
    const bed = await makeInboxTestBed({ friends: [makeFriend('bob', { status: 'pending', mySecret: undefined })] });
    enqueueOutboxMessages(bed.db, [
      { messageId: 'm1', recipientId: 'bob', type: 'FriendRequest', encryptedMessage: [] },
      { messageId: 'm2', recipientId: 'carol', type: 'Reaction', encryptedMessage: [] },
    ]);

    await bed.testBed.dispatchHandled(removeFriend({ friendId: 'bob', notify: true, fromUserAction: true }));

    expect(friend(bed.testBed, 'bob')).toBeUndefined();
    expect(outboxRows(bed.db)).toEqual([
      ['carol', 'Reaction'],
      ['bob', 'Unfriend'],
    ]);
    expect(revoked(bed)).toEqual([]);
  });

  it('removing a friend tells them and revokes the secret we issued', async () => {
    const bed = await makeInboxTestBed({ friends: [makeFriend('bob')] });

    await bed.testBed.dispatchHandled(removeFriend({ friendId: 'bob', notify: true, fromUserAction: true }));

    expect(friend(bed.testBed, 'bob')).toBeUndefined();
    expect(readFriends(bed.db)).toEqual([]);
    expect(outboxRows(bed.db)).toEqual([['bob', 'Unfriend']]);
    expect(revoked(bed)).toEqual(['my-secret-bob']);
    expect(bed.testBed.getState().feed.revokedFollowSecrets).toEqual(['my-secret-bob']);
    bed.testBed.getDispatchedAction(revokeFollowSecrets);
  });

  it('removing someone who holds our key rotates it', async () => {
    const bed = await makeInboxTestBed({
      friends: [makeFriend('bob'), makeFriend('carol', { status: 'legacyFollower' })],
    });

    await bed.testBed.dispatchHandled(removeFriend({ friendId: 'bob', notify: true, fromUserAction: true }));
    await bed.testBed.dispatchHandled(removeFriend({ friendId: 'carol', notify: true, fromUserAction: true }));

    expect(rotations(bed)).toBe(2);
  });

  it('removing someone who never had our key does not rotate it', async () => {
    const bed = await makeInboxTestBed({
      friends: [
        makeFriend('alice', { status: 'incoming', mySecret: undefined }),
        makeFriend('bob', { status: 'pending', mySecret: undefined }),
        makeFriend('carol', { status: 'legacyFollowing', mySecret: undefined }),
      ],
    });

    for (const friendId of ['alice', 'bob', 'carol']) {
      await bed.testBed.dispatchHandled(removeFriend({ friendId, notify: true, fromUserAction: true }));
    }

    expect(rotations(bed)).toBe(0);
  });

  it('rebuilds the keys it shares when our key rotates while they are being prepared', async () => {
    const bed = await makeInboxTestBed({ friends: [makeFriend('alice', { status: 'incoming', mySecret: undefined })] });
    const rotatedKey = { value: new Uint8Array([42]) };
    const build = bed.services.feedFollowService.friendKeysMessage.getMockImplementation()!;
    bed.services.feedFollowService.friendKeysMessage.mockImplementationOnce((...args) => {
      bed.testBed.dispatch(setIdentity(RemoteData.success(identity.with({ aesKey: rotatedKey }))));
      return build(...args);
    });

    await bed.testBed.dispatchHandled(acceptFriendRequest({ friendId: 'alice', fromUserAction: true }));

    const calls = bed.services.feedFollowService.friendKeysMessage.mock.calls;
    expect(calls.map(([sharedFrom]) => sharedFrom.aesKey)).toEqual([identity.aesKey, rotatedKey]);
    expect(outboxRows(bed.db)).toEqual([['alice', 'FriendKeys']]);
  });

  it('sharing back turns a one-way follow into a friendship', async () => {
    const bed = await makeInboxTestBed({
      friends: [makeFriend('bob', { status: 'legacyFollowing', mySecret: undefined })],
    });

    await bed.testBed.dispatchHandled(shareBackWithFriend({ friendId: 'bob', fromUserAction: true }));

    expect(friend(bed.testBed, 'bob')?.status).toBe('friend');
    expect(friend(bed.testBed, 'bob')?.mySecret).toMatch(/^issued-/);
    expect(outboxRows(bed.db)).toEqual([['bob', 'FriendKeys']]);
  });

  it('declining to share back unfollows without revoking anything', async () => {
    const bed = await makeInboxTestBed({
      friends: [makeFriend('bob', { status: 'legacyFollowing', mySecret: undefined })],
    });

    await bed.testBed.dispatchHandled(removeFriend({ friendId: 'bob', notify: true, fromUserAction: true }));

    expect(outboxRows(bed.db)).toEqual([['bob', 'Unfriend']]);
    expect(revoked(bed)).toEqual([]);
  });

  it('rejects follow requests left over from before friends', async () => {
    const bed = await makeInboxTestBed();
    bed.db
      .insert(feedFollowRequestsSchema)
      .values({ id: 'old', payload: inbox.legacyFollowRequest('old') as never })
      .run();

    await bed.testBed.dispatchHandled(rejectLegacyFollowRequests());

    expect(outboxRows(bed.db)).toEqual([['old', 'FollowResponse']]);
    expect(bed.db.select().from(feedFollowRequestsSchema).all()).toEqual([]);
  });
});

describe('friend messages', () => {
  it('a request from a stranger waits for us to accept', async () => {
    const bed = await makeInboxTestBed();
    deliver(bed.services, [inbox.friendRequest('alice', 'Alice')]);

    await poll(bed.testBed);

    expect(friend(bed.testBed, 'alice')?.status).toBe('incoming');
    expect(friend(bed.testBed, 'alice')?.name).toBe('Alice');
    expect(outboxRows(bed.db)).toEqual([]);
  });

  it('crossed requests accept each other', async () => {
    const bed = await makeInboxTestBed({ friends: [makeFriend('bob', { status: 'pending', mySecret: undefined })] });
    deliver(bed.services, [inbox.friendRequest('bob')]);

    await poll(bed.testBed);

    expect(friend(bed.testBed, 'bob')?.status).toBe('pending');
    expect(friend(bed.testBed, 'bob')?.mySecret).toMatch(/^issued-/);
    expect(outboxRows(bed.db)).toEqual([['bob', 'FriendKeys']]);
  });

  it('a friend asking again gets our keys without a new secret', async () => {
    const bed = await makeInboxTestBed({ friends: [makeFriend('bob')] });
    deliver(bed.services, [inbox.friendRequest('bob')]);

    await poll(bed.testBed);

    expect(friend(bed.testBed, 'bob')?.mySecret).toBe('my-secret-bob');
    expect(bed.services.feedFollowService.issueFollowSecretAsync).not.toHaveBeenCalled();
    expect(outboxRows(bed.db)).toEqual([['bob', 'FriendKeys']]);
  });

  it('a request from someone we follow one-way does not share back for us', async () => {
    const bed = await makeInboxTestBed({
      friends: [makeFriend('bob', { status: 'legacyFollowing', mySecret: undefined })],
    });
    deliver(bed.services, [inbox.friendRequest('bob')]);

    await poll(bed.testBed);

    expect(friend(bed.testBed, 'bob')?.status).toBe('legacyFollowing');
    expect(outboxRows(bed.db)).toEqual([]);
  });

  it('keys from someone we asked make them a friend, and ours go back', async () => {
    const bed = await makeInboxTestBed({
      friends: [makeFriend('bob', { status: 'pending', mySecret: undefined, theirSecret: undefined, theirKeys: [] })],
    });
    deliver(bed.services, [inbox.friendKeys('bob', ['a2V5'], 'bobs-secret')]);

    await poll(bed.testBed);

    const bob = friend(bed.testBed, 'bob')!;
    expect(bob.status).toBe('friend');
    expect(bob.theirSecret).toBe('bobs-secret');
    expect(bob.theirKeys).toHaveLength(1);
    expect(bob.mySecret).toMatch(/^issued-/);
    expect(outboxRows(bed.db)).toEqual([['bob', 'FriendKeys']]);
  });

  it('keys after crossed requests complete the friendship without a reply', async () => {
    const bed = await makeInboxTestBed({ friends: [makeFriend('bob', { status: 'pending', theirKeys: [] })] });
    deliver(bed.services, [inbox.friendKeys('bob')]);

    await poll(bed.testBed);

    expect(friend(bed.testBed, 'bob')?.status).toBe('friend');
    expect(outboxRows(bed.db)).toEqual([]);
  });

  it('keys from a one-way follower who shared back make them a friend', async () => {
    const bed = await makeInboxTestBed({
      friends: [makeFriend('carol', { status: 'legacyFollower', theirSecret: undefined, theirKeys: [] })],
    });
    deliver(bed.services, [inbox.friendKeys('carol')]);

    await poll(bed.testBed);

    expect(friend(bed.testBed, 'carol')?.status).toBe('friend');
    expect(outboxRows(bed.db)).toEqual([]);
  });

  it('new keys from someone we follow one-way do not share back for us', async () => {
    const bed = await makeInboxTestBed({
      friends: [makeFriend('bob', { status: 'legacyFollowing', mySecret: undefined })],
    });
    deliver(bed.services, [inbox.friendKeys('bob', ['bmV3'], 'new-secret')]);

    await poll(bed.testBed);

    expect(friend(bed.testBed, 'bob')?.status).toBe('legacyFollowing');
    expect(friend(bed.testBed, 'bob')?.theirSecret).toBe('new-secret');
  });

  it('ignores keys older than the ones we already hold', async () => {
    const bed = await makeInboxTestBed({
      friends: [makeFriend('bob', { theirKeysSentAt: Instant.ofEpochMilli(5000) })],
    });
    deliver(bed.services, [{ json: inbox.friendKeys('bob', ['b2xk'], 'old-secret'), sentAtMs: 4000 }]);

    await poll(bed.testBed);

    expect(friend(bed.testBed, 'bob')?.theirSecret).toBe('their-secret-bob');
  });

  it('ignores keys from strangers and from requests we have not accepted', async () => {
    const bed = await makeInboxTestBed({ friends: [makeFriend('alice', { status: 'incoming', theirKeys: [] })] });
    deliver(bed.services, [inbox.friendKeys('alice'), inbox.friendKeys('mallory')]);

    await poll(bed.testBed);

    expect(friend(bed.testBed, 'alice')?.theirKeys).toEqual([]);
    expect(friend(bed.testBed, 'mallory')).toBeUndefined();
  });

  it('a rejection only ends a request we are still waiting on', async () => {
    const bed = await makeInboxTestBed({
      friends: [makeFriend('bob', { status: 'pending' }), makeFriend('carol')],
    });
    deliver(bed.services, [inbox.friendReject('bob'), inbox.friendReject('carol')]);

    await poll(bed.testBed);

    expect(friend(bed.testBed, 'bob')).toBeUndefined();
    expect(friend(bed.testBed, 'carol')?.status).toBe('friend');
  });

  it('being unfriended removes them quietly and revokes our secret', async () => {
    const bed = await makeInboxTestBed({ friends: [makeFriend('bob')] });
    deliver(bed.services, [inbox.unfriend('bob')]);

    await poll(bed.testBed);

    expect(friend(bed.testBed, 'bob')).toBeUndefined();
    expect(outboxRows(bed.db)).toEqual([]);
    expect(revoked(bed)).toEqual(['my-secret-bob']);
    expect(rotations(bed)).toBe(1);
  });

  it('treats an unfollow from an older app as being unfriended', async () => {
    const bed = await makeInboxTestBed({ friends: [makeFriend('bob', { status: 'legacyFollower' })] });
    deliver(bed.services, [inbox.legacyUnfollow('bob')]);

    await poll(bed.testBed);

    expect(friend(bed.testBed, 'bob')).toBeUndefined();
  });

  it('turns down a follow request from an older app', async () => {
    const bed = await makeInboxTestBed();
    deliver(bed.services, [inbox.legacyFollowRequest('old'), inbox.legacyFollowResponse('older')]);

    await poll(bed.testBed);

    expect(bed.testBed.getState().feed.friends).toEqual({});
    expect(outboxRows(bed.db)).toEqual([['old', 'FollowResponse']]);
  });
});

describe('friend handshake end to end', () => {
  it('one request and one accept make both sides friends with each other’s keys', async () => {
    const alice = await makeInboxTestBed();
    const bob = await makeInboxTestBed();

    await alice.testBed.dispatchHandled(requestFriend({ user: sharedUser('bob'), fromUserAction: true }));
    deliver(bob.services, [{ json: inbox.friendRequest('alice'), sentAtMs: 1 }]);
    await poll(bob.testBed);

    await bob.testBed.dispatchHandled(acceptFriendRequest({ friendId: 'alice', fromUserAction: true }));
    const bobsSecret = friend(bob.testBed, 'alice')!.mySecret!;
    deliver(alice.services, [{ json: inbox.friendKeys('bob', ['Ym9i'], bobsSecret), sentAtMs: 2 }]);
    await poll(alice.testBed);

    const alicesSecret = friend(alice.testBed, 'bob')!.mySecret!;
    deliver(bob.services, [{ json: inbox.friendKeys('alice', ['YWxpY2U='], alicesSecret), sentAtMs: 3 }]);
    await poll(bob.testBed);

    expect(friend(alice.testBed, 'bob')).toMatchObject({ status: 'friend', theirSecret: bobsSecret });
    expect(friend(bob.testBed, 'alice')).toMatchObject({ status: 'friend', theirSecret: alicesSecret });
    expect(outboxRows(alice.db)).toEqual([
      ['bob', 'FriendRequest'],
      ['bob', 'FriendKeys'],
    ]);
    expect(outboxRows(bob.db)).toEqual([['alice', 'FriendKeys']]);
  });

  it('sharing back after an upgrade makes both sides friends without a reply', async () => {
    const alice = await makeInboxTestBed({
      friends: [makeFriend('bob', { status: 'legacyFollowing', mySecret: undefined, theirSecret: 'bobs-secret' })],
    });
    const bob = await makeInboxTestBed({
      friends: [makeFriend('alice', { status: 'legacyFollower', theirSecret: undefined, theirKeys: [] })],
    });

    await alice.testBed.dispatchHandled(shareBackWithFriend({ friendId: 'bob', fromUserAction: true }));
    const alicesSecret = friend(alice.testBed, 'bob')!.mySecret!;
    deliver(bob.services, [{ json: inbox.friendKeys('alice', ['YWxpY2U='], alicesSecret), sentAtMs: 1 }]);
    await poll(bob.testBed);

    expect(friend(alice.testBed, 'bob')).toMatchObject({ status: 'friend', theirSecret: 'bobs-secret' });
    expect(friend(bob.testBed, 'alice')).toMatchObject({ status: 'friend', theirSecret: alicesSecret });
    expect(outboxRows(alice.db)).toEqual([['bob', 'FriendKeys']]);
    expect(outboxRows(bob.db)).toEqual([]);
  });
});

describe('repairing a friendship end to end', () => {
  const repairRow = (friendId: string, awaitingReply: boolean) => ({
    friendId,
    kind: 'staleKeys' as const,
    firstNoticedAtMs: 0,
    lastSentAtMs: 0,
    attempts: 1,
    awaitingReply,
  });

  it('keys from a friend we asked to repair get ours back, once', async () => {
    const bed = await makeInboxTestBed({ friends: [makeFriend('bob')] });
    writeFriendRepairs(bed.db, [repairRow('bob', true)]);
    deliver(bed.services, [
      { json: inbox.friendKeys('bob'), sentAtMs: 1 },
      { json: inbox.friendKeys('bob'), sentAtMs: 2 },
    ]);

    await poll(bed.testBed);

    expect(outboxRows(bed.db)).toEqual([['bob', 'FriendKeys']]);
    expect(readFriendRepairs(bed.db)).toMatchObject([{ friendId: 'bob', awaitingReply: false }]);
  });

  it('keys from a friend we did not ask get no reply', async () => {
    const bed = await makeInboxTestBed({ friends: [makeFriend('bob')] });
    writeFriendRepairs(bed.db, [repairRow('bob', false)]);
    deliver(bed.services, [inbox.friendKeys('bob')]);

    await poll(bed.testBed);

    expect(outboxRows(bed.db)).toEqual([]);
  });

  it('reconnects with a friend who restored a backup from before we met', async () => {
    const alice = await makeInboxTestBed({ friends: [makeFriend('bob')] });
    addRepairEffects(alice.testBed.addEffect);
    const bob = await makeInboxTestBed();

    await alice.testBed.dispatchHandled(repairFriends({ undecryptable: ['bob'] }));
    deliver(bob.services, [{ json: inbox.friendRequest('alice'), sentAtMs: 1 }]);
    await poll(bob.testBed);
    expect(friend(bob.testBed, 'alice')?.status).toBe('incoming');

    await bob.testBed.dispatchHandled(acceptFriendRequest({ friendId: 'alice', fromUserAction: true }));
    const bobsSecret = friend(bob.testBed, 'alice')!.mySecret!;
    deliver(alice.services, [{ json: inbox.friendKeys('bob', ['bmV3'], bobsSecret), sentAtMs: 2 }]);
    await poll(alice.testBed);

    const alicesSecret = friend(alice.testBed, 'bob')!.mySecret!;
    deliver(bob.services, [{ json: inbox.friendKeys('alice', ['YWxpY2U='], alicesSecret), sentAtMs: 3 }]);
    await poll(bob.testBed);

    expect(outboxRows(alice.db)).toEqual([
      ['bob', 'FriendRequest'],
      ['bob', 'FriendKeys'],
    ]);
    expect(friend(alice.testBed, 'bob')).toMatchObject({ status: 'friend', theirSecret: bobsSecret });
    expect(friend(bob.testBed, 'alice')).toMatchObject({ status: 'friend', theirSecret: alicesSecret });
  });

  it('a lost accept is recovered by the side that accepted', async () => {
    const alice = await makeInboxTestBed({ friends: [makeFriend('bob', { status: 'pending', mySecret: undefined })] });
    const bob = await makeInboxTestBed({
      friends: [makeFriend('alice', { theirKeys: [], theirSecret: undefined, mySecret: 'bobs-secret' })],
    });
    addRepairEffects(bob.testBed.addEffect);
    const now = Date.now();
    writeFriendRepairs(bob.db, [
      {
        friendId: 'alice',
        kind: 'missingKeys',
        firstNoticedAtMs: now - 8 * 24 * 60 * 60 * 1000,
        lastSentAtMs: null,
        attempts: 0,
        awaitingReply: false,
      },
    ]);

    await bob.testBed.dispatchHandled(repairFriends({ undecryptable: [] }));
    expect(outboxRows(bob.db)).toEqual([
      ['alice', 'FriendKeys'],
      ['alice', 'FriendRequest'],
    ]);
    deliver(alice.services, [
      { json: inbox.friendKeys('bob', ['Ym9i'], 'bobs-secret'), sentAtMs: 1 },
      { json: inbox.friendRequest('bob'), sentAtMs: 2 },
    ]);
    await poll(alice.testBed);

    const alicesSecret = friend(alice.testBed, 'bob')!.mySecret!;
    deliver(bob.services, [{ json: inbox.friendKeys('alice', ['YWxpY2U='], alicesSecret), sentAtMs: 3 }]);
    await poll(bob.testBed);

    expect(friend(alice.testBed, 'bob')).toMatchObject({ status: 'friend', theirSecret: 'bobs-secret' });
    expect(friend(bob.testBed, 'alice')).toMatchObject({ status: 'friend', theirSecret: alicesSecret });
  });
});
