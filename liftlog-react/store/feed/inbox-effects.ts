import { addEffect } from '@/store/listenerMiddleware';
import {
  fetchInboxItems,
  feedApiError,
  setFollowRequests,
  setFollowers,
  processFollowResponses,
} from '@/store/feed';
import { FeedIdentity, FollowRequest, FeedUser } from '@/models/feed-models';
import { GetInboxMessagesRequest } from '@/models/feed-api-models';
import { fromUuidDao } from '@/models/storage/conversions.from-dao';
import { AesKey } from '@/models/encryption-models';

export function addInboxEffects() {
  addEffect(
    fetchInboxItems,
    async (
      action,
      {
        dispatch,
        getState,
        extra: { feedApiService, feedInboxDecryptionService },
      },
    ) => {
      const state = getState();
      const identityRemote = state.feed.identity;

      if (!identityRemote.isSuccess()) {
        return;
      }

      const identity = FeedIdentity.fromPOJO(identityRemote.data);

      const inboxItemsResponse = await feedApiService.getInboxMessagesAsync({
        userId: identity.id,
        password: identity.password,
      } as GetInboxMessagesRequest);

      if (!inboxItemsResponse.isSuccess()) {
        dispatch(
          feedApiError({
            message: 'Failed to fetch inbox items',
            error: inboxItemsResponse.error!,
            action,
          }),
        );
        return;
      }

      const encryptedInboxItems = inboxItemsResponse.data.inboxMessages;

      // Decrypt all inbox messages
      const inboxItems = (
        await Promise.all(
          encryptedInboxItems.map((x) =>
            feedInboxDecryptionService.decryptIfValid(identity, x),
          ),
        )
      ).filter((x) => x !== null);

      // Process follow requests
      const newFollowRequests = inboxItems
        .filter((x) => x.messagePayload === 'followRequest')
        .map((x) => {
          const userId = fromUuidDao(x.fromUserId);
          const name = x.followRequest?.name?.value;
          return new FollowRequest(userId, name ?? undefined);
        });

      if (newFollowRequests.length > 0) {
        const currentFollowRequests = getState().feed.followRequests.map(
          FollowRequest.fromPOJO,
        );
        const updatedFollowRequests = [
          ...currentFollowRequests,
          ...newFollowRequests,
        ];
        dispatch(setFollowRequests(updatedFollowRequests));
      }

      // Process follow responses
      const newFollowResponses = inboxItems
        .filter((x) => x.messagePayload === 'followResponse')
        .map((x) => {
          const userId = fromUuidDao(x.fromUserId);
          const isAccepted = !!x.followResponse?.accepted;

          return {
            userId,
            accepted: isAccepted,
            aesKey: isAccepted
              ? ({ value: x.followResponse?.accepted?.aesKey } as AesKey)
              : null,
            followSecret: isAccepted
              ? x.followResponse?.accepted?.followSecret
              : null,
          };
        });

      dispatch(processFollowResponses({ responses: newFollowResponses }));

      // Process unfollow notifications
      const followers = Object.values(getState().feed.followers).map(
        FeedUser.fromPOJO,
      );
      const unfollowNotifications = inboxItems
        .filter((x) => x.messagePayload === 'unfollowNotification')
        .flatMap((x) => {
          const fromUserId = fromUuidDao(x.fromUserId);
          const unfollowSecret = x.unfollowNotification?.followSecret;

          return followers.filter(
            (f) => f.id === fromUserId && f.followSecret === unfollowSecret,
          );
        });

      // Remove unfollowed users from followers
      if (unfollowNotifications.length > 0) {
        const currentFollowers = Object.fromEntries(
          Object.entries(getState().feed.followers).map(([key, value]) => [
            key,
            FeedUser.fromPOJO(value),
          ]),
        );

        unfollowNotifications.forEach((unfollowedUser) => {
          delete currentFollowers[unfollowedUser.id];
        });

        dispatch(setFollowers(currentFollowers));
      }
    },
  );
}
