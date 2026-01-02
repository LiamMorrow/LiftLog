import { Instant, OffsetDateTime, ZoneId } from '@js-joda/core';
import {
  publishUnpublishedSessions,
  replaceFeedItems,
  removeUnpublishedSessionId,
  replaceFeedFollowedUsers,
  feedApiError,
  fetchFeedItems,
  setIsFetching,
} from '@/store/feed';
import { addEffect } from '@/store/store';
import { LiftLog } from '@/gen/proto';
import {
  FeedIdentity,
  FeedUser,
  FeedItem,
  SessionFeedItem,
  RemovedSessionFeedItem,
} from '@/models/feed-models';
import { Session } from '@/models/session-models';
import {
  GetEventsRequest,
  GetUsersRequest,
  GetUserEventRequest,
  PutUserEventRequest,
  GetUserResponse,
  UserEventResponse,
} from '@/models/feed-api-models';
import { AesEncryptedAndRsaSignedData } from '@/models/encryption-models';
import { toSessionDao, toUuidDao } from '@/models/storage/conversions.to-dao';
import {
  fromSessionDao,
  fromSessionBlueprintDao,
  fromUuidDao,
} from '@/models/storage/conversions.from-dao';
import { EncryptionService } from '@/services/encryption-service';
import { FeedApiService } from '@/services/feed-api';
import { selectSession } from '@/store/stored-sessions';
import { SessionBlueprint } from '@/models/blueprint-models';

const MIN_TIMESTAMP = Instant.parse('2000-01-01T00:00:00Z');

export function addFeedItemEffects() {
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
        const originalFollowedUsers = Object.fromEntries(
          Object.entries(state.feed.followedUsers).map(([key, value]) => [
            key,
            FeedUser.fromPOJO(value),
          ]),
        );

        // Get latest event timestamp for each user
        const userIdToLatestEvent = state.feed.feed
          .map(FeedItem.fromPOJO)
          .reduce((acc, item) => {
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
          .filter(([_, user]) => user.followSecret !== undefined)
          .map(
            ([userId, user]) =>
              ({
                userId: userId,
                followSecret: user.followSecret!,
                since:
                  userIdToLatestEvent.get(userId)?.toString() ||
                  MIN_TIMESTAMP.toString(),
              }) as GetUserEventRequest,
          );

        if (followedUsersWithFollowSecret.length === 0) {
          return;
        }

        // Fetch feed events and users in parallel
        const [feedResponse, usersResponse] = await Promise.all([
          feedApiService.getUserEventsAsync({
            users: followedUsersWithFollowSecret,
          } as GetEventsRequest),
          feedApiService.getUsersAsync({
            ids: followedUsersWithFollowSecret.map((x) => x.userId),
          } as GetUsersRequest),
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
              if (!originalUser?.aesKey) {
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
              (user) => !user.followSecret,
            ),
          )
          .filter((user) => !invalidFollowSecrets.has(user.followSecret || ''));

        dispatch(replaceFeedFollowedUsers(newUsers));

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

        // Filter and sort feed items
        const now = Instant.now();
        const existingFeedItems = state.feed.feed.map(FeedItem.fromPOJO);
        const allFeedItems = existingFeedItems.concat(feedItems);

        const updatedFeed = [
          ...allFeedItems
            .filter((item) => item.expiry.isAfter(now))
            .filter((item) => newUsers.some((user) => user.id === item.userId))
            // Group by (userId, eventId) and take the latest
            .reduce((acc, item) => {
              const key = `${item.userId}-${item.eventId}`;
              const existing = acc.get(key);
              if (!existing || item.timestamp.isAfter(existing.timestamp)) {
                acc.set(key, item);
              }
              return acc;
            }, new Map<string, FeedItem>())
            .values(),
        ]
          .sort((a, b) => {
            // Sort by session date for SessionFeedItems, otherwise by timestamp
            const aTime =
              a instanceof SessionFeedItem
                ? a.session.date
                    .atStartOfDay()
                    .atZone(ZoneId.systemDefault())
                    .toInstant()
                : a.timestamp;
            const bTime =
              b instanceof SessionFeedItem
                ? b.session.date
                    .atStartOfDay()
                    .atZone(ZoneId.systemDefault())
                    .toInstant()
                : b.timestamp;

            const result = bTime.compareTo(aTime);
            if (result !== 0) return result;

            return b.timestamp.compareTo(a.timestamp);
          })
          .filter((item) => !(item instanceof RemovedSessionFeedItem)); // Filter out removed sessions

        dispatch(replaceFeedItems(updatedFeed));
      } finally {
        dispatch(setIsFetching(false));
      }
    },
  );

  addEffect(
    publishUnpublishedSessions,
    async (
      action,
      { dispatch, getState, extra: { feedApiService, encryptionService } },
    ) => {
      const state = getState();
      const identityRemote = state.feed.identity;

      if (!identityRemote.isSuccess()) {
        return;
      }

      const identity = FeedIdentity.fromPOJO(identityRemote.data);
      if (!identity.publishWorkouts) {
        return;
      }

      const unpublishedSessionIds = [...state.feed.unpublishedSessionIds];

      for (const sessionId of unpublishedSessionIds) {
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

async function publishSessionAsync(
  identity: FeedIdentity,
  session: Session,
  encryptionService: EncryptionService,
  feedApiService: FeedApiService,
) {
  const sessionPayload = LiftLog.Ui.Models.UserEventPayload.create({
    sessionPayload: {
      session: toSessionDao(
        identity.publishBodyweight
          ? session
          : session.with({ bodyweight: undefined }),
      ),
    },
  });

  const payloadBytes =
    LiftLog.Ui.Models.UserEventPayload.encode(sessionPayload).finish();

  const encryptedData =
    await encryptionService.signRsa256PssAndEncryptAesCbcAsync(
      payloadBytes,
      identity.aesKey,
      identity.rsaKeyPair.privateKey,
    );

  return await feedApiService.putUserEventAsync({
    userId: identity.id,
    password: identity.password,
    eventId: session.id,
    encryptedEventPayload: encryptedData.encryptedPayload,
    encryptedEventIV: encryptedData.iv.value,
    expiry: Instant.now()
      .plusSeconds(90 * 24 * 60 * 60)
      .toString(), // 90 days
  } as PutUserEventRequest);
}

async function removePublishedSessionAsync(
  identity: FeedIdentity,
  sessionId: string,
  encryptionService: EncryptionService,
  feedApiService: FeedApiService,
) {
  const sessionPayload = LiftLog.Ui.Models.UserEventPayload.create({
    removedSessionPayload: {
      sessionId: toUuidDao(sessionId),
    },
  });

  const payloadBytes =
    LiftLog.Ui.Models.UserEventPayload.encode(sessionPayload).finish();

  const encryptedData =
    await encryptionService.signRsa256PssAndEncryptAesCbcAsync(
      payloadBytes,
      identity.aesKey,
      identity.rsaKeyPair.privateKey,
    );

  return await feedApiService.putUserEventAsync({
    userId: identity.id,
    password: identity.password,
    eventId: sessionId,
    encryptedEventPayload: encryptedData.encryptedPayload,
    encryptedEventIV: encryptedData.iv.value,
    expiry: Instant.now()
      .plusSeconds(90 * 24 * 60 * 60)
      .toString(), // 90 days
  } as PutUserEventRequest);
}

async function getDecryptedUserAsync(
  originalUser: FeedUser,
  response: GetUserResponse,
  encryptionService: EncryptionService,
): Promise<FeedUser | null> {
  try {
    let name: string | undefined;
    let currentPlan: SessionBlueprint[] = [];
    let profilePicture: Uint8Array | undefined;

    // Decrypt name if present
    if (response.encryptedName && response.encryptedName.length > 0) {
      const decryptedNameBytes =
        await encryptionService.decryptAesCbcAndVerifyRsa256PssAsync(
          {
            encryptedPayload: response.encryptedName,
            iv: { value: response.encryptionIV },
          } as AesEncryptedAndRsaSignedData,
          originalUser.aesKey!,
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
          } as AesEncryptedAndRsaSignedData,
          originalUser.aesKey!,
          originalUser.publicKey,
        );

      const currentPlanDao =
        LiftLog.Ui.Models.CurrentPlanDaoV1.decode(decryptedPlanBytes);
      currentPlan = currentPlanDao.sessions.map(fromSessionBlueprintDao);
    }

    // Decrypt profile picture if present
    if (
      response.encryptedProfilePicture &&
      response.encryptedProfilePicture.length > 0
    ) {
      profilePicture =
        await encryptionService.decryptAesCbcAndVerifyRsa256PssAsync(
          {
            encryptedPayload: response.encryptedProfilePicture,
            iv: { value: response.encryptionIV },
          } as AesEncryptedAndRsaSignedData,
          originalUser.aesKey!,
          originalUser.publicKey,
        );
    }

    return new FeedUser(
      originalUser.id,
      originalUser.publicKey,
      name,
      originalUser.nickname,
      currentPlan,
      profilePicture,
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
): Promise<FeedItem | null> {
  const user = users.find((u) => u.id === userEvent.userId);
  if (!user || !user.aesKey) {
    return null;
  }

  try {
    const decryptedPayload =
      await encryptionService.decryptAesCbcAndVerifyRsa256PssAsync(
        {
          encryptedPayload: userEvent.encryptedEventPayload,
          iv: { value: userEvent.encryptedEventIV },
        } as AesEncryptedAndRsaSignedData,
        user.aesKey,
        user.publicKey,
      );

    const payload = LiftLog.Ui.Models.UserEventPayload.decode(decryptedPayload);

    const timestamp = OffsetDateTime.parse(userEvent.timestamp).toInstant();
    const expiry = OffsetDateTime.parse(userEvent.expiry).toInstant();

    switch (payload.eventPayload) {
      case 'sessionPayload':
        return new SessionFeedItem(
          userEvent.userId,
          userEvent.eventId,
          timestamp,
          expiry,
          fromSessionDao(payload.sessionPayload!.session),
        );

      case 'removedSessionPayload':
        return new RemovedSessionFeedItem(
          userEvent.userId,
          userEvent.eventId,
          timestamp,
          expiry,
          fromUuidDao(payload.removedSessionPayload!.sessionId),
        );

      default:
        return null;
    }
  } catch (error) {
    console.error('Failed to decrypt feed item. Skipping.', error);
    return null;
  }
}
