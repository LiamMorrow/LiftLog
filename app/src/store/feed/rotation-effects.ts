import { Instant } from '@js-joda/core';
import { AddEffectFn, AppDispatch, RootState } from '@/store/store';
import { flushOutbox, rotateFeedKey, selectFeedIdentityRemote, setIdentity, updateFeedIdentity } from '@/store/feed';
import { Friend } from '@/models/feed-models';
import { RemoteData } from '@/models/remote';
import { OutboxMessage, replaceOutboxMessage } from '@/db/feed-outbox';
import { feedIdentitySchema } from '@/db/schema';
import { upsert } from '@/db/helpers';
import { Services } from '@/services';

export type KeyHolder = Friend & { mySecret: string };

export function keyHolders(friends: Iterable<Friend>): KeyHolder[] {
  return [...friends].filter((x): x is KeyHolder => !!x.mySecret);
}

export function addRotationEffects(addEffect: AddEffectFn) {
  let isRotating = false;
  let rotateAgain = false;

  addEffect(rotateFeedKey, async (_, { dispatch, getState, extra }) => {
    if (isRotating) {
      rotateAgain = true;
      return;
    }
    isRotating = true;
    try {
      do {
        rotateAgain = false;
        if ((await rotateOnce(dispatch, getState, extra)) === 'restart') {
          rotateAgain = true;
        }
      } while (rotateAgain);
    } finally {
      isRotating = false;
    }
  });
}

async function rotateOnce(
  dispatch: AppDispatch,
  getState: () => RootState,
  { db, encryptionService, feedFollowService }: Pick<Services, 'db' | 'encryptionService' | 'feedFollowService'>,
): Promise<'done' | 'restart'> {
  const before = selectFeedIdentityRemote(getState()).unwrapOr(undefined);
  if (!before) {
    return 'done';
  }
  const rotated = before.withRotatedAesKey(await encryptionService.generateAesKey(), Instant.now());
  const built = new Map<string, { mySecret: string; message: OutboxMessage }>();

  for (;;) {
    const current = selectFeedIdentityRemote(getState()).unwrapOr(undefined);
    if (!current || current.id !== before.id) {
      return 'done';
    }
    if (current.aesKey !== before.aesKey || current.rsaKeyPair !== before.rsaKeyPair) {
      return 'restart';
    }

    const holders = keyHolders(Object.values(getState().feed.friends));
    const unbuilt = holders.filter((x) => built.get(x.id)?.mySecret !== x.mySecret);
    if (unbuilt.length) {
      for (const holder of unbuilt) {
        built.set(holder.id, {
          mySecret: holder.mySecret,
          message: await feedFollowService.friendKeysMessage(rotated, holder, holder.mySecret),
        });
      }
      continue;
    }

    const committed = current.with({ aesKey: rotated.aesKey, previousAesKeys: rotated.previousAesKeys });
    db.transaction((tx) => {
      upsert(tx, feedIdentitySchema, [{ id: 0, payload: committed.toJSON() }]);
      holders.forEach((x) => replaceOutboxMessage(tx, built.get(x.id)!.message));
    });
    dispatch(setIdentity(RemoteData.success(committed)));
    dispatch(updateFeedIdentity({ updates: {}, fromUserAction: false }));
    if (holders.length) {
      dispatch(flushOutbox());
    }
    return 'done';
  }
}
