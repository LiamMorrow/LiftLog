import { Instant } from '@js-joda/core';
import {
  publishUnpublishedSessions,
  removeUnpublishedSessionId,
  feedApiError,
  fetchFeedItems,
  setIsFetching,
  patchFriendProfiles,
  removeFeedItems,
  removeFriend,
  repairFriends,
  selectAcceptedFriends,
  selectSharingLive,
  setLiveSessions,
  upsertFeedItems,
} from '@/store/feed';
import { AddEffectFn, AppDispatch, RootState } from '@/store/store';
import { compareFeedItems } from '@/store/feed/feed-timeline';
import {
  FeedIdentity,
  Friend,
  FeedUserEvent,
  FEED_EVENT_RETENTION_SECONDS,
  fromFeedUserEventJSON,
  LIVE_EVENT_STALE_SECONDS,
  LiveSessionUserEvent,
  RemovedSessionUserEvent,
  SessionUserEvent,
} from '@/models/feed-models';
import { enqueueLivePublish, settleLivePublish } from '@/store/feed/live-publish-queue';
import { Session } from '@/models/session-models';
import { GetUserResponse, UserEventResponse } from '@/models/feed-api-models';
import { EncryptionService, fromJsonBytes, splitNonceAndCiphertext, toJsonBytes } from '@/services/encryption-service';
import { FeedApiService } from '@/services/feed-api';
import { readSession } from '@/db/sessions';
import { feedUnpublishedSessionsSchema } from '@/db/schema';
import { AnyVersionUserEventJSON } from '@/models/storage/versions/any';
import { userEventMigrations } from '@/models/storage/versions/migrations';
import { AesEncryptedAndRsaSignedData, AesKey } from '@/models/encryption-models';

const MIN_TIMESTAMP = Instant.parse('2000-01-01T00:00:00Z');

export function addFeedItemEffects(addEffect: AddEffectFn) {
  let fetchAgain = false;

  addEffect(fetchFeedItems, async (action, { dispatch, getState, extra: { feedApiService, encryptionService } }) => {
    if (getState().feed.isFetching) {
      fetchAgain = true;
      return;
    }
    dispatch(publishUnpublishedSessions());

    try {
      dispatch(setIsFetching(true));
      let undecryptable: string[] | undefined;
      do {
        fetchAgain = false;
        undecryptable = await fetchOnce(action, dispatch, getState, feedApiService, encryptionService);
      } while (fetchAgain);
      if (undecryptable) {
        dispatch(repairFriends({ undecryptable }));
      }
    } finally {
      dispatch(setIsFetching(false));
    }
  });

  addEffect(
    publishUnpublishedSessions,
    async (_, { dispatch, getState, extra: { db, feedApiService, feedHubService, encryptionService } }) => {
      const state = getState();
      const identityRemote = state.feed.identity;

      if (!identityRemote.isSuccess()) {
        return;
      }

      const identity = identityRemote.data;
      if (!identity.publishWorkouts) {
        return;
      }

      await settleLivePublish();
      const unpublishedSessionIds = await db.select().from(feedUnpublishedSessionsSchema);

      for (const { sessionId } of unpublishedSessionIds) {
        const session = readSession(db, sessionId);

        let result;
        if (session) {
          result = await publishSessionAsync(identity, session, encryptionService, feedApiService);
        } else {
          result = await removePublishedSessionAsync(identity, sessionId, encryptionService, feedApiService);
        }

        if (result?.isSuccess()) {
          dispatch(removeUnpublishedSessionId(sessionId));
          if (selectSharingLive(getState())) {
            await enqueueLivePublish(() => feedHubService.endLive(sessionId));
          }
        }
      }
    },
  );
}

async function fetchOnce(
  action: ReturnType<typeof fetchFeedItems>,
  dispatch: AppDispatch,
  getState: () => RootState,
  feedApiService: FeedApiService,
  encryptionService: EncryptionService,
): Promise<string[] | undefined> {
  const state = getState();
  const friends = selectAcceptedFriends(state).filter((x) => x.theirSecret && x.theirKeys.length);

  const latestEventByUser = new Map<string, Instant>();
  for (const item of state.feed.feed) {
    const current = latestEventByUser.get(item.userId);
    if (!current || item.timestamp.isAfter(current)) {
      latestEventByUser.set(item.userId, item.timestamp);
    }
  }

  if (friends.length === 0) {
    dispatch(removeFeedItems(state.feed.feed.map((x) => x.id)));
    dispatch(setLiveSessions([]));
    return [];
  }

  const [feedResponse, usersResponse] = await Promise.all([
    feedApiService.getUserEventsAsync({
      users: friends.map((friend) => ({
        userId: friend.id,
        followSecret: friend.theirSecret!,
        since: (latestEventByUser.get(friend.id) ?? MIN_TIMESTAMP).toString(),
      })),
    }),
    feedApiService.getUsersAsync({ ids: friends.map((x) => x.id) }),
  ]);

  if (!feedResponse.isSuccess()) {
    dispatch(feedApiError({ message: 'Failed to fetch feed items', error: feedResponse.error!, action }));
    return undefined;
  }
  if (!usersResponse.isSuccess()) {
    dispatch(feedApiError({ message: 'Failed to fetch users', error: usersResponse.error!, action }));
    return undefined;
  }

  const undecryptable = new Set<string>();
  const profiles = await Promise.all(
    friends.map(async (friend) => {
      const response = usersResponse.data.users[friend.id];
      return response ? decryptProfileAsync(friend, response, encryptionService) : undefined;
    }),
  );
  profiles.forEach((x, i) => x === 'undecryptable' && undecryptable.add(friends[i]!.id));
  dispatch(patchFriendProfiles(profiles.filter((x) => x !== undefined && x !== 'undecryptable')));

  const invalidFollowSecrets = new Set(feedResponse.data.invalidFollowSecrets);
  removeFriendsWithInvalidSecrets(invalidFollowSecrets, dispatch, getState);

  const friendsById = new Map(friends.map((x) => [x.id, x]));
  const decryptedEvents = await Promise.all(
    feedResponse.data.events.map((event) => {
      const friend = friendsById.get(event.userId);
      return friend ? toFeedItemAsync(event, friend, encryptionService) : Promise.resolve(null);
    }),
  );
  decryptedEvents.forEach((x, i) => x === 'undecryptable' && undecryptable.add(feedResponse.data.events[i]!.userId));
  const feedItems = decryptedEvents.filter(
    (item) => item !== null && item !== 'undecryptable' && item.type !== 'LiveSessionUserEvent',
  );

  const now = Instant.now();
  const currentFriendIds = new Set(
    selectAcceptedFriends(getState())
      .filter((x) => x.theirSecret)
      .map((x) => x.id),
  );
  const existingFeedItems = getState().feed.feed as FeedUserEvent[];

  const deduped = [
    ...existingFeedItems
      .concat(feedItems)
      .reduce((acc, item) => {
        const key = `${item.userId}-${item.eventId}`;
        const existing = acc.get(key);
        if (!existing || item.timestamp.isAfter(existing.timestamp)) {
          acc.set(key, item);
        }
        return acc;
      }, new Map<string, FeedUserEvent>())
      .values(),
  ];

  const validItems = deduped.filter(
    (item) => item.expiry.isAfter(now) && currentFriendIds.has(item.userId) && item.type !== 'RemovedSessionUserEvent',
  );
  const validIds = new Set(validItems.map((x) => x.id));
  const removedIds = existingFeedItems.filter((item) => !validIds.has(item.id)).map((item) => item.id);

  const sorted = validItems.sort(compareFeedItems);

  if (removedIds.length) dispatch(removeFeedItems(removedIds));
  dispatch(upsertFeedItems(sorted as SessionUserEvent[]));

  const settledKeys = new Set(deduped.map((item) => `${item.userId}-${item.eventId}`));
  dispatch(
    setLiveSessions(
      getState().feed.liveSessions.filter(
        (item) => currentFriendIds.has(item.userId) && !settledKeys.has(`${item.userId}-${item.eventId}`),
      ),
    ),
  );

  return friends.filter((x) => undecryptable.has(x.id) && !invalidFollowSecrets.has(x.theirSecret!)).map((x) => x.id);
}

export function removeFriendsWithInvalidSecrets(
  invalidFollowSecrets: Set<string>,
  dispatch: AppDispatch,
  getState: () => RootState,
) {
  for (const friend of selectAcceptedFriends(getState())) {
    if (friend.theirSecret && invalidFollowSecrets.has(friend.theirSecret)) {
      dispatch(removeFriend({ friendId: friend.id, notify: false, fromUserAction: false }));
    }
  }
}

export function encryptLiveSessionAsync(
  identity: FeedIdentity,
  session: Session,
  encryptionService: EncryptionService,
) {
  const now = Instant.now();
  return encryptEvent(
    identity,
    new LiveSessionUserEvent(
      identity.id,
      session.id,
      now,
      now.plusSeconds(LIVE_EVENT_STALE_SECONDS),
      identity.publishBodyweight ? session : session.with({ bodyweight: undefined }),
    ),
    encryptionService,
  );
}

function encryptEvent(identity: FeedIdentity, event: FeedUserEvent, encryptionService: EncryptionService) {
  return encryptionService.signAndEncryptAsync(
    toJsonBytes(event.toJSON()),
    identity.aesKey,
    identity.rsaKeyPair.privateKey,
  );
}

async function publishEvent(
  identity: FeedIdentity,
  event: FeedUserEvent,
  encryptionService: EncryptionService,
  feedApiService: FeedApiService,
) {
  const encryptedData = await encryptEvent(identity, event, encryptionService);

  return await feedApiService.putUserEventAsync({
    userId: identity.id,
    password: identity.password,
    eventId: event.eventId,
    encryptedEventPayload: encryptedData.encryptedPayload,
    encryptedEventIV: encryptedData.iv.value,
    expiry: event.expiry.toString(),
  });
}
export async function publishSessionAsync(
  identity: FeedIdentity,
  session: Session,
  encryptionService: EncryptionService,
  feedApiService: FeedApiService,
) {
  const publishedSession = identity.publishBodyweight ? session : session.with({ bodyweight: undefined });

  return publishEvent(
    identity,
    new SessionUserEvent(
      identity.id,
      session.id,
      Instant.now(),
      Instant.now().plusSeconds(FEED_EVENT_RETENTION_SECONDS),
      publishedSession,
    ),
    encryptionService,
    feedApiService,
  );
}

async function removePublishedSessionAsync(
  identity: FeedIdentity,
  sessionId: string,
  encryptionService: EncryptionService,
  feedApiService: FeedApiService,
) {
  return publishEvent(
    identity,
    new RemovedSessionUserEvent(
      identity.id,
      sessionId,
      Instant.now(),
      Instant.now().plusSeconds(FEED_EVENT_RETENTION_SECONDS),
      sessionId,
    ),
    encryptionService,
    feedApiService,
  );
}

class NoKeyDecrypts extends Error {}

async function decryptWithKeysAsync(
  payloadFor: (key: AesKey) => AesEncryptedAndRsaSignedData,
  friend: Friend,
  encryptionService: EncryptionService,
): Promise<Uint8Array> {
  let lastError: unknown;
  for (const key of friend.theirKeys) {
    try {
      return await encryptionService.decryptAndVerifyAsync(payloadFor(key), key, friend.publicKey);
    } catch (error) {
      lastError = error;
    }
  }
  throw new NoKeyDecrypts('None of the keys this friend shared decrypt it', { cause: lastError });
}

async function decryptProfileAsync(
  friend: Friend,
  response: GetUserResponse,
  encryptionService: EncryptionService,
): Promise<{ id: string; name: string | undefined } | 'undecryptable' | undefined> {
  const profileField =
    (field: Uint8Array) =>
    (key: AesKey): AesEncryptedAndRsaSignedData =>
      key.algorithm === 'AES-GCM'
        ? splitNonceAndCiphertext(field)
        : { encryptedPayload: field, iv: { value: response.encryptionIV } };
  try {
    const name = response.encryptedName?.length
      ? new TextDecoder().decode(
          await decryptWithKeysAsync(profileField(response.encryptedName), friend, encryptionService),
        )
      : undefined;
    return { id: friend.id, name };
  } catch (error) {
    console.warn('Could not decrypt a friend profile; keeping the last one', error);
    return error instanceof NoKeyDecrypts ? 'undecryptable' : undefined;
  }
}

export async function toFeedItemAsync(
  userEvent: Pick<UserEventResponse, 'encryptedEventPayload' | 'encryptedEventIV'>,
  friend: Friend,
  encryptionService: EncryptionService,
): Promise<FeedUserEvent | 'undecryptable' | null> {
  try {
    const decryptedPayload = await decryptWithKeysAsync(
      () => ({ encryptedPayload: userEvent.encryptedEventPayload, iv: { value: userEvent.encryptedEventIV } }),
      friend,
      encryptionService,
    );
    const payload = fromJsonBytes<AnyVersionUserEventJSON>(decryptedPayload);
    return fromFeedUserEventJSON(userEventMigrations.migrate(payload));
  } catch (error) {
    console.error('Failed to decrypt feed item. Skipping.', error);
    return error instanceof NoKeyDecrypts ? 'undecryptable' : null;
  }
}
