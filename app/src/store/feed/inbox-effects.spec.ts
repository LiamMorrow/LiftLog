import { describe, expect, it } from 'vitest';
import { INBOX_SEEN_RETENTION_MS } from '@/store/feed/inbox-effects';
import { fetchFeedItems, fetchInboxItems, removeFriends, setIdentity, upsertReceivedReactions } from '@/store/feed';
import { FeedIdentity, MAX_REACTIONS_PER_SENDER_PER_EVENT, ReceivedReaction } from '@/models/feed-models';
import { RemoteData } from '@/models/remote';
import { ApiErrorType, ApiResult } from '@/services/api-error';
import { feedInboxQueueSchema, feedInboxSeenSchema } from '@/db/schema';
import { makeFriend } from '@/store/feed/__test__/friends';
import { deliver, identity, inbox, InboxTestBed, makeInboxTestBed } from '@/store/feed/__test__/inbox-harness';

const FRIEND_ID = 'friend-1';

function makeTestBed(options?: Parameters<typeof makeInboxTestBed>[0]) {
  return makeInboxTestBed({ friends: [makeFriend(FRIEND_ID)], ...options });
}

function acceptedReactions(testBed: InboxTestBed['testBed']): ReceivedReaction[] {
  return Object.values(testBed.getState().feed.receivedReactions);
}

const poll = (testBed: InboxTestBed['testBed']) => testBed.dispatchHandled(fetchInboxItems({ fromUserAction: true }));

describe('inbox-effects reactions', () => {
  it('accepts a cheer from a friend on a session you own', async () => {
    const { testBed, services } = await makeTestBed();
    deliver(services, [inbox.cheer(FRIEND_ID, { count: 5 })]);

    await poll(testBed);

    const accepted = acceptedReactions(testBed);
    expect(accepted).toHaveLength(1);
    expect(accepted[0]!.count).toBe(5);
    expect(accepted[0]!.fromUserId).toBe(FRIEND_ID);
  });

  it('drops a cheer from someone who is not a friend', async () => {
    const { testBed, services } = await makeTestBed({ friends: [] });
    deliver(services, [inbox.cheer(FRIEND_ID)]);

    await poll(testBed);

    expect(acceptedReactions(testBed)).toHaveLength(0);
  });

  it('drops a cheer from someone who has not accepted yet', async () => {
    const { testBed, services } = await makeTestBed({ friends: [makeFriend(FRIEND_ID, { status: 'pending' })] });
    deliver(services, [inbox.cheer(FRIEND_ID)]);

    await poll(testBed);

    expect(acceptedReactions(testBed)).toHaveLength(0);
  });

  it('drops a cheer targeting a session you do not own', async () => {
    const { testBed, services } = await makeTestBed();
    deliver(services, [inbox.cheer(FRIEND_ID, { eventId: 'someone-elses-session' })]);

    await poll(testBed);

    expect(acceptedReactions(testBed)).toHaveLength(0);
  });

  it('does not double count a redelivered cheer', async () => {
    const { testBed, services } = await makeTestBed();
    deliver(services, [
      inbox.cheer(FRIEND_ID, { reactionId: 'r1', count: 3 }),
      inbox.cheer(FRIEND_ID, { reactionId: 'r1', count: 3 }),
    ]);

    await poll(testBed);

    const accepted = acceptedReactions(testBed);
    expect(accepted).toHaveLength(1);
    expect(accepted[0]!.count).toBe(3);
  });

  it('caps how many cheers one sender can store against a single event', async () => {
    const { testBed, services } = await makeTestBed();
    deliver(
      services,
      Array.from({ length: MAX_REACTIONS_PER_SENDER_PER_EVENT + 10 }, (_, i) =>
        inbox.cheer(FRIEND_ID, { reactionId: `r${i}` }),
      ),
    );

    await poll(testBed);

    expect(acceptedReactions(testBed)).toHaveLength(MAX_REACTIONS_PER_SENDER_PER_EVENT);
  });

  it('dispatches accepted cheers so they are persisted', async () => {
    const { testBed, services } = await makeTestBed();
    deliver(services, [inbox.cheer(FRIEND_ID)]);

    await poll(testBed);

    testBed.getDispatchedAction(upsertReceivedReactions);
  });
});

describe('inbox-effects delivery', () => {
  it('asks the server to keep messages until they are acked', async () => {
    const { testBed, services } = await makeTestBed();

    await poll(testBed);

    expect(services.feedApiService.getInboxMessagesAsync).toHaveBeenCalledWith({
      userId: identity.id,
      password: identity.password,
      manualAck: true,
    });
  });

  it('acks processed and unreadable messages, but leaves ones to retry on the server', async () => {
    const { testBed, services } = await makeTestBed();
    const [ok, invalid] = deliver(services, [
      { json: inbox.cheer(FRIEND_ID, { reactionId: 'r1' }) },
      { json: inbox.cheer(FRIEND_ID, { reactionId: 'r2' }), kind: 'invalid' },
      { json: inbox.cheer(FRIEND_ID, { reactionId: 'r3' }), kind: 'retry' },
    ]);

    await poll(testBed);

    expect(services.feedApiService.ackInboxMessagesAsync).toHaveBeenCalledWith({
      userId: identity.id,
      password: identity.password,
      ids: [ok, invalid],
    });
    expect(acceptedReactions(testBed).map((x) => x.id)).toEqual(['r1']);
  });

  it('processes a message delivered twice only once', async () => {
    const { testBed, services } = await makeTestBed({ friends: [] });
    deliver(services, [{ json: inbox.friendRequest('alice'), messageId: 'm1' }]);
    await poll(testBed);
    testBed.dispatch(removeFriends(['alice']));

    deliver(services, [{ json: inbox.friendRequest('alice'), messageId: 'm1' }]);
    await poll(testBed);

    expect(testBed.getState().feed.friends.alice).toBeUndefined();
  });

  it('processes messages in the order they were sent', async () => {
    const { testBed, services } = await makeTestBed({ friends: [] });
    deliver(services, [
      { json: inbox.unfriend('alice'), sentAtMs: 2000 },
      { json: inbox.friendRequest('alice'), sentAtMs: 1000 },
    ]);

    await poll(testBed);

    expect(testBed.getState().feed.friends.alice).toBeUndefined();
  });

  it('processes messages a previous run queued but never handled', async () => {
    const { testBed, db } = await makeTestBed({ friends: [] });
    db.insert(feedInboxQueueSchema)
      .values({ messageId: 'left-over', sentAtMs: 0, payload: inbox.friendRequest('alice') })
      .run();

    await poll(testBed);

    expect(testBed.getState().feed.friends.alice?.status).toBe('incoming');
    expect(db.select().from(feedInboxQueueSchema).all()).toEqual([]);
  });

  it('still drains the local queue when the server cannot be reached', async () => {
    const { testBed, services, db } = await makeTestBed({ friends: [] });
    db.insert(feedInboxQueueSchema)
      .values({ messageId: 'left-over', sentAtMs: 0, payload: inbox.friendRequest('alice') })
      .run();
    services.feedApiService.getInboxMessagesAsync.mockResolvedValue(
      ApiResult.fromError({ type: ApiErrorType.Unknown, message: 'offline', exception: undefined }),
    );

    await testBed.dispatchHandled(fetchInboxItems({ fromUserAction: false }));

    expect(testBed.getState().feed.friends.alice?.status).toBe('incoming');
  });

  it('keeps a message queued when handling it needs the network and the network is down', async () => {
    const { testBed, services, db } = await makeTestBed({ friends: [] });
    deliver(services, [inbox.friendRequest('alice')]);
    services.feedApiService.getUserAsync.mockResolvedValue(
      ApiResult.fromError({ type: ApiErrorType.Unknown, message: 'offline', exception: undefined }),
    );

    await poll(testBed);

    expect(testBed.getState().feed.friends.alice).toBeUndefined();
    expect(db.select().from(feedInboxQueueSchema).all()).toHaveLength(1);
  });

  it('holds back a sender’s later messages while an earlier one waits to retry', async () => {
    const { testBed, services, db } = await makeTestBed({ friends: [] });
    deliver(services, [
      { json: inbox.friendRequest('alice'), sentAtMs: 1000 },
      { json: inbox.unfriend('alice'), sentAtMs: 2000 },
    ]);
    services.feedApiService.getUserAsync.mockResolvedValueOnce(
      ApiResult.fromError({ type: ApiErrorType.Unknown, message: 'offline', exception: undefined }),
    );

    await poll(testBed);
    expect(db.select().from(feedInboxQueueSchema).all()).toHaveLength(2);

    deliver(services, []);
    await poll(testBed);

    expect(testBed.getState().feed.friends.alice).toBeUndefined();
    expect(db.select().from(feedInboxQueueSchema).all()).toEqual([]);
  });

  it('refreshes the feed after every poll', async () => {
    const { testBed } = await makeTestBed();

    await poll(testBed);

    testBed.getDispatchedAction(fetchFeedItems);
  });

  it('forgets seen message ids once they are past the retention window', async () => {
    const { testBed, db } = await makeTestBed();
    db.insert(feedInboxSeenSchema)
      .values([
        { messageId: 'old', seenAtMs: Date.now() - INBOX_SEEN_RETENTION_MS - 1000 },
        { messageId: 'recent', seenAtMs: Date.now() },
      ])
      .run();

    await poll(testBed);

    expect(
      db
        .select()
        .from(feedInboxSeenSchema)
        .all()
        .map((x) => x.messageId),
    ).toEqual(['recent']);
  });

  it('stops without queueing anything when the identity changes mid-poll', async () => {
    const { testBed, services, db } = await makeTestBed();
    deliver(services, [inbox.friendRequest('alice')]);
    services.feedApiService.getInboxMessagesAsync.mockImplementation(async () => {
      testBed.dispatch(setIdentity(RemoteData.success({ id: 'someone-else', password: 'pw' } as FeedIdentity)));
      return ApiResult.success({ inboxMessages: [{ id: 'server-x', encryptedMessage: [] }] });
    });

    await poll(testBed);

    expect(services.feedInboxDecryptionService.decrypt).not.toHaveBeenCalled();
    expect(db.select().from(feedInboxQueueSchema).all()).toEqual([]);
  });

  it('runs one poll at a time, and polls again if asked while busy', async () => {
    const { testBed, services } = await makeTestBed();
    let release!: () => void;
    services.feedApiService.getInboxMessagesAsync.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          release = () => resolve(ApiResult.success({ inboxMessages: [] }));
        }),
    );

    const first = poll(testBed);
    await poll(testBed);
    expect(services.feedApiService.getInboxMessagesAsync).toHaveBeenCalledTimes(1);

    release();
    await first;

    expect(services.feedApiService.getInboxMessagesAsync).toHaveBeenCalledTimes(2);
  });
});
