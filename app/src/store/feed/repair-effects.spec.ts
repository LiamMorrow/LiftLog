import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { putFriends, removeFriend, repairFriends } from '@/store/feed';
import { addRepairEffects } from '@/store/feed/repair-effects';
import { readFriendRepairs } from '@/db/feed-friend-repair';
import { Friend } from '@/models/feed-models';
import { makeFriend } from '@/store/feed/__test__/friends';
import { makeInboxTestBed, outboxRows } from '@/store/feed/__test__/inbox-harness';

const DAY_MS = 24 * 60 * 60 * 1000;
const START = Date.parse('2026-10-01T00:00:00Z');

async function makeBed(friends: Friend[]) {
  const bed = await makeInboxTestBed({ friends });
  addRepairEffects(bed.testBed.addEffect);
  const repair = async (onDay: number, undecryptable: string[] = []) => {
    vi.setSystemTime(START + onDay * DAY_MS);
    await bed.testBed.dispatchHandled(repairFriends({ undecryptable }));
  };
  return { ...bed, repair };
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
});

afterEach(() => {
  vi.useRealTimers();
});

describe('repairing friends whose keys we cannot use', () => {
  it('asks for their keys again straight away', async () => {
    const bed = await makeBed([makeFriend('bob')]);

    await bed.repair(0, ['bob']);

    expect(outboxRows(bed.db)).toEqual([['bob', 'FriendRequest']]);
    expect(readFriendRepairs(bed.db)).toMatchObject([{ friendId: 'bob', kind: 'staleKeys', awaitingReply: true }]);
  });

  it('asks again weekly, at most four times', async () => {
    const bed = await makeBed([makeFriend('bob')]);

    for (const day of [0, 3, 7, 10, 14, 21, 28, 35, 60]) {
      await bed.repair(day, ['bob']);
    }

    expect(outboxRows(bed.db)).toEqual(Array.from({ length: 4 }, () => ['bob', 'FriendRequest']));
  });

  it('forgets the repair once their feed decrypts again', async () => {
    const bed = await makeBed([makeFriend('bob')]);
    await bed.repair(0, ['bob']);

    await bed.repair(1);

    expect(readFriendRepairs(bed.db)).toEqual([]);
  });

  it('only repairs friends', async () => {
    const bed = await makeBed([
      makeFriend('alice', { status: 'incoming' }),
      makeFriend('carol', { status: 'legacyFollowing' }),
      makeFriend('dave', { status: 'legacyFollower', theirKeys: [], theirSecret: undefined }),
    ]);

    await bed.repair(30, ['alice', 'carol', 'dave']);
    await bed.repair(60, ['alice', 'carol', 'dave']);

    expect(outboxRows(bed.db)).toEqual([]);
    expect(readFriendRepairs(bed.db)).toEqual([]);
  });
});

describe('repairing friends whose keys never arrived', () => {
  it('waits a week, then sends our keys and asks for theirs', async () => {
    const bed = await makeBed([makeFriend('bob', { theirKeys: [], theirSecret: undefined })]);

    await bed.repair(0);
    await bed.repair(6);
    expect(outboxRows(bed.db)).toEqual([]);

    await bed.repair(7);

    expect(outboxRows(bed.db)).toEqual([
      ['bob', 'FriendKeys'],
      ['bob', 'FriendRequest'],
    ]);
  });
});

describe('repairing requests that went unanswered', () => {
  it('sends the request again once, after two weeks', async () => {
    const bed = await makeBed([makeFriend('bob', { status: 'pending', mySecret: undefined })]);

    await bed.repair(0);
    await bed.repair(13);
    expect(outboxRows(bed.db)).toEqual([]);

    await bed.repair(14);
    await bed.repair(60);

    expect(outboxRows(bed.db)).toEqual([['bob', 'FriendRequest']]);
  });

  it('starts over when the symptom changes', async () => {
    const bed = await makeBed([makeFriend('bob', { status: 'pending', mySecret: undefined })]);
    await bed.repair(0);
    bed.testBed.dispatch(putFriends([makeFriend('bob', { theirKeys: [], theirSecret: undefined })]));

    await bed.repair(10);
    await bed.repair(16);
    expect(outboxRows(bed.db)).toEqual([]);

    await bed.repair(17);

    expect(outboxRows(bed.db)).toEqual([
      ['bob', 'FriendKeys'],
      ['bob', 'FriendRequest'],
    ]);
  });
});

describe('repair bookkeeping', () => {
  it('forgets the repair when the friend is removed', async () => {
    const bed = await makeBed([makeFriend('bob')]);
    await bed.repair(0, ['bob']);

    await bed.testBed.dispatchHandled(removeFriend({ friendId: 'bob', notify: false, fromUserAction: true }));

    expect(readFriendRepairs(bed.db)).toEqual([]);
  });

  it('does not send a repair the friend no longer needs by the time it is built', async () => {
    const bed = await makeBed([makeFriend('bob', { status: 'pending', mySecret: undefined })]);
    await bed.repair(0);
    const build = bed.services.feedFollowService.friendRequestMessage.getMockImplementation()!;
    bed.services.feedFollowService.friendRequestMessage.mockImplementationOnce((...args) => {
      bed.testBed.dispatch(putFriends([makeFriend('bob')]));
      return build(...args);
    });

    await bed.repair(14);

    expect(outboxRows(bed.db)).toEqual([]);
    expect(readFriendRepairs(bed.db)).toEqual([]);
  });
});
