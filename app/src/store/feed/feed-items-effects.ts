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
  selectAcceptedFriends,
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
  RemovedSessionUserEvent,
  SessionUserEvent,
} from '@/models/feed-models';
import { Session } from '@/models/session-models';
import { GetUserResponse, UserEventResponse } from '@/models/feed-api-models';
import { EncryptionService, fromJsonBytes, toJsonBytes } from '@/services/encryption-service';
import { FeedApiService } from '@/services/feed-api';
import { readSession } from '@/db/sessions';
import { ProgramBlueprint } from '@/models/blueprint-models';
import { feedUnpublishedSessionsSchema } from '@/db/schema';
import { AnyVersionProgramBlueprintJSON, AnyVersionUserEventJSON } from '@/models/storage/versions/any';
import { programBlueprintMigrations, userEventMigrations } from '@/models/storage/versions/migrations';
import { AesEncryptedAndRsaSignedData } from '@/models/encryption-models';

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
      do {
        fetchAgain = false;
        await fetchOnce(action, dispatch, getState, feedApiService, encryptionService);
      } while (fetchAgain);
    } finally {
      dispatch(setIsFetching(false));
    }
  });

  addEffect(
    publishUnpublishedSessions,
    async (_, { dispatch, getState, extra: { db, feedApiService, encryptionService } }) => {
      const state = getState();
      const identityRemote = state.feed.identity;

      if (!identityRemote.isSuccess()) {
        return;
      }

      const identity = identityRemote.data;
      if (!identity.publishWorkouts) {
        return;
      }

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
) {
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
    return;
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
    return;
  }
  if (!usersResponse.isSuccess()) {
    dispatch(feedApiError({ message: 'Failed to fetch users', error: usersResponse.error!, action }));
    return;
  }

  const profiles = await Promise.all(
    friends.map(async (friend) => {
      const response = usersResponse.data.users[friend.id];
      return response ? decryptProfileAsync(friend, response, encryptionService) : undefined;
    }),
  );
  dispatch(patchFriendProfiles(profiles.filter((x) => x !== undefined)));

  const invalidFollowSecrets = new Set(feedResponse.data.invalidFollowSecrets);
  for (const friend of selectAcceptedFriends(getState())) {
    if (friend.theirSecret && invalidFollowSecrets.has(friend.theirSecret)) {
      dispatch(removeFriend({ friendId: friend.id, notify: false, fromUserAction: false }));
    }
  }

  const friendsById = new Map(friends.map((x) => [x.id, x]));
  const feedItems = (
    await Promise.all(
      feedResponse.data.events.map((event) => {
        const friend = friendsById.get(event.userId);
        return friend ? toFeedItemAsync(event, friend, encryptionService) : Promise.resolve(null);
      }),
    )
  ).filter((item) => item !== null);

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
}

async function publishEvent(
  identity: FeedIdentity,
  event: FeedUserEvent,
  encryptionService: EncryptionService,
  feedApiService: FeedApiService,
) {
  const payloadBytes = toJsonBytes(event.toJSON());

  const encryptedData = await encryptionService.signRsa256PssAndEncryptAesCbcAsync(
    payloadBytes,
    identity.aesKey,
    identity.rsaKeyPair.privateKey,
  );

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

async function decryptWithKeysAsync(
  payload: AesEncryptedAndRsaSignedData,
  friend: Friend,
  encryptionService: EncryptionService,
): Promise<Uint8Array> {
  let lastError: unknown = new Error('No keys to decrypt with');
  for (const key of friend.theirKeys) {
    try {
      return await encryptionService.decryptAesCbcAndVerifyRsa256PssAsync(payload, key, friend.publicKey);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

async function decryptProfileAsync(
  friend: Friend,
  response: GetUserResponse,
  encryptionService: EncryptionService,
): Promise<{ id: string; name: string | undefined; currentPlan: ProgramBlueprint | undefined } | undefined> {
  try {
    const iv = { value: response.encryptionIV };
    const name = response.encryptedName?.length
      ? new TextDecoder().decode(
          await decryptWithKeysAsync({ encryptedPayload: response.encryptedName, iv }, friend, encryptionService),
        )
      : undefined;
    const currentPlan = response.encryptedCurrentPlan?.length
      ? ProgramBlueprint.fromJSON(
          programBlueprintMigrations.migrate(
            fromJsonBytes<AnyVersionProgramBlueprintJSON>(
              await decryptWithKeysAsync(
                { encryptedPayload: response.encryptedCurrentPlan, iv },
                friend,
                encryptionService,
              ),
            ),
          ),
        )
      : undefined;
    return { id: friend.id, name, currentPlan };
  } catch (error) {
    console.warn('Could not decrypt a friend profile; keeping the last one', error);
    return undefined;
  }
}

async function toFeedItemAsync(
  userEvent: UserEventResponse,
  friend: Friend,
  encryptionService: EncryptionService,
): Promise<FeedUserEvent | null> {
  try {
    const decryptedPayload = await decryptWithKeysAsync(
      { encryptedPayload: userEvent.encryptedEventPayload, iv: { value: userEvent.encryptedEventIV } },
      friend,
      encryptionService,
    );
    const payload = fromJsonBytes<AnyVersionUserEventJSON>(decryptedPayload);
    return fromFeedUserEventJSON(userEventMigrations.migrate(payload));
  } catch (error) {
    console.error('Failed to decrypt feed item. Skipping.', error);
    return null;
  }
}
