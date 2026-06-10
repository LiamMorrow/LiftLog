import { Instant, ZoneId } from '@js-joda/core';
import {
  publishUnpublishedSessions,
  removeUnpublishedSessionId,
  feedApiError,
  fetchFeedItems,
  setIsFetching,
  putFollowedUser,
  removeFeedItems,
  upsertFeedItems,
} from '@/store/feed';
import { AddEffectFn } from '@/store/store';
import {
  FeedIdentity,
  FeedUser,
  FollowedFeedUser,
  FeedUserEvent as FeedUserEvent,
  fromFeedUserEventJSON,
  RemovedSessionUserEvent,
  SessionUserEvent,
} from '@/models/feed-models';
import { Session } from '@/models/session-models';
import { GetUserResponse, UserEventResponse } from '@/models/feed-api-models';
import {
  EncryptionService,
  fromJsonBytes,
  toJsonBytes,
} from '@/services/encryption-service';
import { FeedApiService } from '@/services/feed-api';
import { selectSession } from '@/store/stored-sessions';
import { ProgramBlueprint } from '@/models/blueprint-models';
import {
  FeedUserEventJSON,
  ProgramBlueprintJSON,
} from '@/models/storage/versions/latest';
import { feedUnpublishedSessionsSchema } from '@/db/schema';

const MIN_TIMESTAMP = Instant.parse('2000-01-01T00:00:00Z');

export function addFeedItemEffects(addEffect: AddEffectFn) {
  addEffect(
    fetchFeedItems,
    async (
      action,
      { dispatch, getState, extra: { feedApiService, encryptionService } },
    ) => {
      const state = getState();
      if (state.feed.isFetching) {
        return;
      }
      dispatch(publishUnpublishedSessions());

      try {
        dispatch(setIsFetching(true));
        const originalFollowedUsers = state.feed.followedUsers;

        // Get latest event timestamp for each user
        const userIdToLatestEvent = state.feed.feed.reduce((acc, item) => {
          const current = acc.get(item.userId);
          if (!current || item.timestamp.isAfter(current)) {
            acc.set(item.userId, item.timestamp);
          }
          return acc;
        }, new Map<string, Instant>());

        // Get followed users with follow secrets
        const followedUsersWithFollowSecret = Object.entries(
          originalFollowedUsers,
        )
          .filter(
            (x): x is [string, FollowedFeedUser] =>
              x[1].type === 'FollowedFeedUser',
          )
          .map(([userId, user]) => ({
            userId: userId,
            followSecret: user.followSecret,
            since:
              userIdToLatestEvent.get(userId)?.toString() ||
              MIN_TIMESTAMP.toString(),
          }));

        if (followedUsersWithFollowSecret.length === 0) {
          dispatch(removeFeedItems(getState().feed.feed.map((x) => x.id)));
          return;
        }

        // Fetch feed events and users in parallel
        const [feedResponse, usersResponse] = await Promise.all([
          feedApiService.getUserEventsAsync({
            users: followedUsersWithFollowSecret,
          }),
          feedApiService.getUsersAsync({
            ids: followedUsersWithFollowSecret.map((x) => x.userId),
          }),
        ]);

        if (!feedResponse.isSuccess()) {
          dispatch(
            feedApiError({
              message: 'Failed to fetch feed items',
              error: feedResponse.error!,
              action,
            }),
          );
          return;
        }

        if (!usersResponse.isSuccess()) {
          dispatch(
            feedApiError({
              message: 'Failed to fetch users',
              error: usersResponse.error!,
              action,
            }),
          );
          return;
        }

        const feedEvents = feedResponse.data.events;
        const invalidFollowSecrets = new Set(
          feedResponse.data.invalidFollowSecrets,
        );
        const users = usersResponse.data.users;

        // Decrypt and update user information
        const newUsers = (
          await Promise.all(
            Object.entries(users).map(async ([userId, userResponse]) => {
              const originalUser = originalFollowedUsers[userId];
              if (!originalUser) {
                return undefined;
              }
              if (originalUser.type === 'PendingFeedUser') {
                return originalUser;
              }

              return await getDecryptedUserAsync(
                originalUser,
                userResponse,
                encryptionService,
              );
            }),
          )
        )
          .filter((user) => user !== null && user !== undefined)
          .concat(
            Object.values(originalFollowedUsers).filter(
              (user) => user.type === 'PendingFeedUser',
            ),
          )
          .filter(
            (user) =>
              user.type === 'PendingFeedUser' ||
              !invalidFollowSecrets.has(user.followSecret || ''),
          );

        newUsers.forEach((user) => dispatch(putFollowedUser(user)));

        // Decrypt and process feed events
        const feedItems = (
          await Promise.all(
            feedEvents
              .filter((event) =>
                newUsers.some((user) => user.id === event.userId),
              )
              .map((event) =>
                toFeedItemAsync(event, newUsers, encryptionService),
              ),
          )
        ).filter((item) => item !== null);

        const now = Instant.now();
        const existingFeedItems = state.feed.feed as FeedUserEvent[];
        const allFeedItems = existingFeedItems.concat(feedItems);

        // Dedup by (userId, eventId), keeping latest timestamp
        const deduped = [
          ...allFeedItems
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
          (item) =>
            item.expiry.isAfter(now) &&
            newUsers.some((user) => user.id === item.userId) &&
            item.type !== 'RemovedSessionUserEvent',
        );

        const removedIds = deduped
          .filter((item) => !validItems.some((v) => v.id === item.id))
          .map((item) => item.id);

        const sorted = validItems.sort((a, b) => {
          const aTime =
            a.type === 'SessionUserEvent'
              ? a.session.date
                  .atStartOfDay()
                  .atZone(ZoneId.systemDefault())
                  .toInstant()
              : a.timestamp;
          const bTime =
            b.type === 'SessionUserEvent'
              ? b.session.date
                  .atStartOfDay()
                  .atZone(ZoneId.systemDefault())
                  .toInstant()
              : b.timestamp;

          const result = bTime.compareTo(aTime);
          if (result !== 0) return result;
          return b.timestamp.compareTo(a.timestamp);
        });

        if (removedIds.length) dispatch(removeFeedItems(removedIds));
        dispatch(upsertFeedItems(sorted as SessionUserEvent[]));
      } finally {
        dispatch(setIsFetching(false));
      }
    },
  );

  addEffect(
    publishUnpublishedSessions,
    async (
      _,
      { dispatch, getState, extra: { db, feedApiService, encryptionService } },
    ) => {
      const state = getState();
      const identityRemote = state.feed.identity;

      if (!identityRemote.isSuccess()) {
        return;
      }

      const identity = identityRemote.data;
      if (!identity.publishWorkouts) {
        return;
      }

      const unpublishedSessionIds = await db
        .select()
        .from(feedUnpublishedSessionsSchema);

      for (const { sessionId } of unpublishedSessionIds) {
        const session = selectSession(getState(), sessionId);

        let result;
        if (session) {
          result = await publishSessionAsync(
            identity,
            session,
            encryptionService,
            feedApiService,
          );
        } else {
          result = await removePublishedSessionAsync(
            identity,
            sessionId,
            encryptionService,
            feedApiService,
          );
        }

        if (result?.isSuccess()) {
          dispatch(removeUnpublishedSessionId(sessionId));
        }
      }
    },
  );
}

async function publishEvent(
  identity: FeedIdentity,
  event: FeedUserEvent,
  encryptionService: EncryptionService,
  feedApiService: FeedApiService,
) {
  const payloadBytes = toJsonBytes(event.toJSON());

  const encryptedData =
    await encryptionService.signRsa256PssAndEncryptAesCbcAsync(
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
async function publishSessionAsync(
  identity: FeedIdentity,
  session: Session,
  encryptionService: EncryptionService,
  feedApiService: FeedApiService,
) {
  return publishEvent(
    identity,
    new SessionUserEvent(
      identity.id,
      session.id,
      Instant.now(),
      Instant.now().plusSeconds(90 * 24 * 60 * 60),
      session,
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
      Instant.now().plusSeconds(90 * 24 * 60 * 60), // 90 days
      sessionId,
    ),
    encryptionService,
    feedApiService,
  );
}

async function getDecryptedUserAsync(
  originalUser: FollowedFeedUser,
  response: GetUserResponse,
  encryptionService: EncryptionService,
): Promise<FeedUser | null> {
  try {
    let name: string | undefined;
    let currentPlan: ProgramBlueprint | undefined;

    // Decrypt name if present
    if (response.encryptedName && response.encryptedName.length > 0) {
      const decryptedNameBytes =
        await encryptionService.decryptAesCbcAndVerifyRsa256PssAsync(
          {
            encryptedPayload: response.encryptedName,
            iv: { value: response.encryptionIV },
          },
          originalUser.aesKey,
          originalUser.publicKey,
        );
      name = new TextDecoder().decode(decryptedNameBytes);
    }

    // Decrypt current plan if present
    if (
      response.encryptedCurrentPlan &&
      response.encryptedCurrentPlan.length > 0
    ) {
      const decryptedPlanBytes =
        await encryptionService.decryptAesCbcAndVerifyRsa256PssAsync(
          {
            encryptedPayload: response.encryptedCurrentPlan,
            iv: { value: response.encryptionIV },
          },
          originalUser.aesKey,
          originalUser.publicKey,
        );

      const currentPlanJson =
        fromJsonBytes<ProgramBlueprintJSON>(decryptedPlanBytes);
      currentPlan = ProgramBlueprint.fromJSON(currentPlanJson);
    }

    return new FollowedFeedUser(
      originalUser.id,
      originalUser.publicKey,
      name,
      currentPlan,
      originalUser.aesKey,
      originalUser.followSecret,
    );
  } catch (error) {
    console.error('Failed to decrypt feed user', error);

    return null;
  }
}

async function toFeedItemAsync(
  userEvent: UserEventResponse,
  users: FeedUser[],
  encryptionService: EncryptionService,
): Promise<FeedUserEvent | null> {
  const user = users.find((u) => u.id === userEvent.userId);
  if (!user || user.type === 'PendingFeedUser') {
    return null;
  }

  try {
    const decryptedPayload =
      await encryptionService.decryptAesCbcAndVerifyRsa256PssAsync(
        {
          encryptedPayload: userEvent.encryptedEventPayload,
          iv: { value: userEvent.encryptedEventIV },
        },
        user.aesKey,
        user.publicKey,
      );

    const payload = fromJsonBytes<FeedUserEventJSON>(decryptedPayload);

    return fromFeedUserEventJSON(payload);
  } catch (error) {
    console.error('Failed to decrypt feed item. Skipping.', error);
    return null;
  }
}
