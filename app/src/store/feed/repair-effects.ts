import { AddEffectFn, AppDispatch, RootState } from '@/store/store';
import { flushOutbox, repairFriends, selectFeedIdentityRemote } from '@/store/feed';
import { FeedIdentity, Friend, FriendRepairKind } from '@/models/feed-models';
import { deleteFriendRepairs, FriendRepairRow, readFriendRepairs, writeFriendRepairs } from '@/db/feed-friend-repair';
import { enqueueOutboxMessages, OutboxMessage, replaceOutboxMessage } from '@/db/feed-outbox';
import { FeedFollowService } from '@/services/feed-follow-service';
import { Services } from '@/services';

const DAY_MS = 24 * 60 * 60 * 1000;

export const REPAIR_POLICY: Record<
  FriendRepairKind,
  { firstAfterMs: number; repeatEveryMs: number; maxAttempts: number }
> = {
  staleKeys: { firstAfterMs: 0, repeatEveryMs: 7 * DAY_MS, maxAttempts: 4 },
  missingKeys: { firstAfterMs: 7 * DAY_MS, repeatEveryMs: 7 * DAY_MS, maxAttempts: 4 },
  staleRequest: { firstAfterMs: 14 * DAY_MS, repeatEveryMs: 0, maxAttempts: 1 },
};

function symptomOf(friend: Friend, undecryptable: Set<string>): FriendRepairKind | undefined {
  if (friend.status === 'pending') {
    return 'staleRequest';
  }
  if (friend.status !== 'friend') {
    return undefined;
  }
  if (!friend.theirKeys.length || !friend.theirSecret) {
    return 'missingKeys';
  }
  return undecryptable.has(friend.id) ? 'staleKeys' : undefined;
}

function isDue(row: FriendRepairRow, nowMs: number) {
  const policy = REPAIR_POLICY[row.kind];
  if (row.attempts >= policy.maxAttempts) {
    return false;
  }
  const dueAtMs =
    row.lastSentAtMs === null ? row.firstNoticedAtMs + policy.firstAfterMs : row.lastSentAtMs + policy.repeatEveryMs;
  return nowMs >= dueAtMs;
}

function reconcile(
  friends: Friend[],
  existing: FriendRepairRow[],
  undecryptable: Set<string>,
  nowMs: number,
): { rows: FriendRepairRow[]; cleared: string[] } {
  const byId = new Map(existing.map((x) => [x.friendId, x]));
  const rows = friends.flatMap((friend): FriendRepairRow[] => {
    const kind = symptomOf(friend, undecryptable);
    if (!kind) {
      return [];
    }
    const row = byId.get(friend.id);
    return [
      row?.kind === kind
        ? row
        : { friendId: friend.id, kind, firstNoticedAtMs: nowMs, lastSentAtMs: null, attempts: 0, awaitingReply: false },
    ];
  });
  const kept = new Set(rows.map((x) => x.friendId));
  return { rows, cleared: existing.filter((x) => !kept.has(x.friendId)).map((x) => x.friendId) };
}

async function repairMessages(
  kind: FriendRepairKind,
  friend: Friend,
  identity: FeedIdentity,
  feedFollowService: FeedFollowService,
): Promise<OutboxMessage[]> {
  const request = await feedFollowService.friendRequestMessage(identity, friend);
  if (kind !== 'missingKeys' || !friend.mySecret) {
    return [request];
  }
  return [await feedFollowService.friendKeysMessage(identity, friend, friend.mySecret), request];
}

export function addRepairEffects(addEffect: AddEffectFn) {
  let isRepairing = false;
  let rerunWith: string[] | undefined;

  addEffect(repairFriends, async (action, { dispatch, getState, extra }) => {
    if (isRepairing) {
      rerunWith = action.payload.undecryptable;
      return;
    }
    isRepairing = true;
    try {
      let undecryptable: string[] | undefined = action.payload.undecryptable;
      while (undecryptable) {
        rerunWith = undefined;
        if ((await repairOnce(new Set(undecryptable), dispatch, getState, extra)) === 'restart') {
          rerunWith ??= undecryptable;
        }
        undecryptable = rerunWith;
      }
    } finally {
      isRepairing = false;
    }
  });
}

async function repairOnce(
  undecryptable: Set<string>,
  dispatch: AppDispatch,
  getState: () => RootState,
  { db, feedFollowService }: Pick<Services, 'db' | 'feedFollowService'>,
): Promise<'done' | 'restart'> {
  const identity = selectFeedIdentityRemote(getState()).unwrapOr(undefined);
  if (!identity) {
    return 'done';
  }
  const nowMs = Date.now();
  const planned = reconcile(Object.values(getState().feed.friends), readFriendRepairs(db), undecryptable, nowMs);
  const built = new Map(
    await Promise.all(
      planned.rows
        .filter((row) => isDue(row, nowMs))
        .map(async (row) => {
          const friend = getState().feed.friends[row.friendId]!;
          const messages = await repairMessages(row.kind, friend, identity, feedFollowService);
          return [row.friendId, { kind: row.kind, mySecret: friend.mySecret, messages }] as const;
        }),
    ),
  );

  const current = selectFeedIdentityRemote(getState()).unwrapOr(undefined);
  if (!current || current.id !== identity.id) {
    return 'done';
  }
  if (current.aesKey !== identity.aesKey) {
    return 'restart';
  }

  const sent: OutboxMessage[] = [];
  db.transaction((tx) => {
    const { rows, cleared } = reconcile(
      Object.values(getState().feed.friends),
      readFriendRepairs(tx),
      undecryptable,
      nowMs,
    );
    deleteFriendRepairs(tx, cleared);
    writeFriendRepairs(
      tx,
      rows.map((row) => {
        const repair = built.get(row.friendId);
        const friend = getState().feed.friends[row.friendId]!;
        if (!repair || repair.kind !== row.kind || repair.mySecret !== friend.mySecret || !isDue(row, nowMs)) {
          return row;
        }
        for (const message of repair.messages) {
          if (message.type === 'FriendKeys') {
            replaceOutboxMessage(tx, message, nowMs);
          } else {
            enqueueOutboxMessages(tx, [message], nowMs);
          }
        }
        sent.push(...repair.messages);
        return { ...row, lastSentAtMs: nowMs, attempts: row.attempts + 1, awaitingReply: true };
      }),
    );
  });
  if (sent.length) {
    dispatch(flushOutbox());
  }
  return 'done';
}
