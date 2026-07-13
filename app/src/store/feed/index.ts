import { AesKey } from '@/models/encryption-models';
import {
  FeedIdentity,
  FeedUser,
  FollowerFeedUser,
  FollowRequestInboxMessage,
  FollowResponseInboxMessage,
  PendingFeedUser,
  ReactionEmoji,
  ReceivedReaction,
  SentReaction,
  SessionUserEvent,
  SharedItem,
} from '@/models/feed-models';
import { RemoteData } from '@/models/remote';
import { ApiError } from '@/services/api-error';
import { createAction, createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';

type FeedState = {
  isHydrated: boolean;
  identity: RemoteData<FeedIdentity>;
  feed: SessionUserEvent[];
  followedUsers: Record<string, FeedUser>;
  sharedFeedUser: RemoteData<PendingFeedUser>;
  followRequests: FollowRequestInboxMessage[];
  followers: Record<string, FollowerFeedUser>;
  /**
   * Keep a list of secrets which we need to tell the server to revoke.
   * Allows us to remove a follower from our list even if revoking the secret fails due to network issues
   */
  revokedFollowSecrets: string[];
  sharedItem: RemoteData<SharedItem>;
  isFetching: boolean;
  /** Cheers others sent you, keyed by reactionId. Only ever populated for your own workouts. */
  receivedReactions: Record<string, ReceivedReaction>;
  /** Cheers you sent, keyed by reactionId. The server deletes on read, so this is the only record. */
  sentReactions: Record<string, SentReaction>;
};

const initialState: FeedState = {
  isHydrated: false,
  identity: RemoteData.notAsked(),
  isFetching: false,
  feed: [],
  followedUsers: {},
  sharedFeedUser: RemoteData.notAsked(),
  revokedFollowSecrets: [],
  followRequests: [],
  followers: {},
  sharedItem: RemoteData.notAsked(),
  receivedReactions: {},
  sentReactions: {},
};

const feedSlice = createSlice({
  name: 'feed',
  initialState,
  reducers: {
    patchFeedState(state, action: PayloadAction<Partial<FeedState>>) {
      Object.assign(state, action.payload);
    },
    clearFeedState() {
      return { ...initialState, isHydrated: true };
    },
    setIsHydrated(state, action: PayloadAction<boolean>) {
      state.isHydrated = action.payload;
    },
    setIdentity(state, action: PayloadAction<RemoteData<FeedIdentity>>) {
      state.identity = action.payload;
    },
    setFeed(state, action: PayloadAction<SessionUserEvent[]>) {
      state.feed = action.payload;
    },
    removeFollowedUser(state, action: PayloadAction<string>) {
      delete state.followedUsers[action.payload];
    },
    setSharedFeedUser(state, action: PayloadAction<RemoteData<PendingFeedUser>>) {
      state.sharedFeedUser = action.payload;
    },
    setFollowRequests(state, action: PayloadAction<FollowRequestInboxMessage[]>) {
      state.followRequests = action.payload;
    },
    setSharedItem(state, action: PayloadAction<RemoteData<SharedItem>>) {
      state.sharedItem = action.payload;
    },
    setIsFetching(state, action: PayloadAction<boolean>) {
      state.isFetching = action.payload;
    },
    addFollower(state, action: PayloadAction<FollowerFeedUser>) {
      state.followers[action.payload.id] = action.payload;
    },
    removeFollower(state, action: PayloadAction<string>) {
      delete state.followers[action.payload];
    },
    removeFollowRequest(state, action: PayloadAction<FollowRequestInboxMessage>) {
      state.followRequests = state.followRequests.filter((req) => req.senderUserId !== action.payload.senderUserId);
    },
    putFollowedUser(state, action: PayloadAction<FeedUser>) {
      state.followedUsers[action.payload.id] = action.payload;
    },
    upsertFeedItems(state, action: PayloadAction<SessionUserEvent[]>) {
      const ids = action.payload.map((x) => x.id);
      state.feed = state.feed.filter((x) => !ids.includes(x.id)).concat(action.payload);
    },
    removeFeedItems(state, action: PayloadAction<string[]>) {
      state.feed = state.feed.filter((x) => !action.payload.includes(x.id));
    },
    addRevokableFollowSecret(state, actions: PayloadAction<string>) {
      state.revokedFollowSecrets.push(actions.payload);
    },
    removeRevokableFollowSecret(state, actions: PayloadAction<string>) {
      state.revokedFollowSecrets = state.revokedFollowSecrets.filter((x) => x !== actions.payload);
    },
    upsertReceivedReactions(state, action: PayloadAction<ReceivedReaction[]>) {
      for (const reaction of action.payload) {
        state.receivedReactions[reaction.id] = reaction;
      }
    },
    setSentReaction(state, action: PayloadAction<SentReaction>) {
      state.sentReactions[action.payload.id] = action.payload;
    },
    removeSentReaction(state, action: PayloadAction<string>) {
      delete state.sentReactions[action.payload];
    },
    removeReactionsForEvents(state, action: PayloadAction<string[]>) {
      for (const [id, reaction] of Object.entries(state.receivedReactions)) {
        if (action.payload.includes(reaction.eventId)) {
          delete state.receivedReactions[id];
        }
      }
      for (const [id, reaction] of Object.entries(state.sentReactions)) {
        if (action.payload.includes(reaction.eventId)) {
          delete state.sentReactions[id];
        }
      }
    },
  },
  selectors: {
    selectSharedFeedUser: (state: FeedState) => state.sharedFeedUser,
    selectSharedItem: (state: FeedState) => state.sharedItem,
    selectFollowRequestCount: createSelector(
      (state: FeedState) => state.followRequests,
      (x) => x.length,
    ),
    selectFeedFollowRequests: (state: FeedState) => state.followRequests,
    selectFeedFollowers: createSelector(
      (state: FeedState) => state.followers,
      (x) => Object.values(x),
    ),
    selectFeedFollowing: createSelector(
      (state: FeedState) => state.followedUsers,
      (x) =>
        Object.entries(x).map(([userId, user]) => ({
          userId,
          user: user,
        })),
    ),
    selectFeedSessionItems: (state: FeedState) => state.feed,
    selectFeedIdentityRemote: (state: FeedState) => state.identity,
    selectOwnFeedUserId: (state: FeedState) => state.identity.unwrapOr(undefined)?.id,
    selectReceivedReactionsByEvent: createSelector(
      (state: FeedState) => state.receivedReactions,
      (reactions) => {
        const byEvent = new Map<string, ReceivedReaction[]>();
        for (const reaction of Object.values(reactions)) {
          const existing = byEvent.get(reaction.eventId);
          if (existing) {
            existing.push(reaction);
          } else {
            byEvent.set(reaction.eventId, [reaction]);
          }
        }
        return byEvent;
      },
    ),
    selectSentReactionsByEvent: createSelector(
      (state: FeedState) => state.sentReactions,
      (reactions) => {
        const byEvent = new Map<string, SentReaction[]>();
        for (const reaction of Object.values(reactions)) {
          const existing = byEvent.get(reaction.eventId);
          if (existing) {
            existing.push(reaction);
          } else {
            byEvent.set(reaction.eventId, [reaction]);
          }
        }
        return byEvent;
      },
    ),
  },
});

export const {
  clearFeedState,
  patchFeedState,
  setIsHydrated,
  setIdentity,
  setSharedFeedUser,
  setFollowRequests,
  setSharedItem,
  setIsFetching,
  addFollower,
  removeFollower,
  removeFollowRequest,
  upsertFeedItems,
  putFollowedUser,
  removeFollowedUser,
  addRevokableFollowSecret,
  removeRevokableFollowSecret,
  removeFeedItems,
  upsertReceivedReactions,
  setSentReaction,
  removeSentReaction,
  removeReactionsForEvents,
} = feedSlice.actions;

export const {
  selectSharedFeedUser,
  selectSharedItem,
  selectFollowRequestCount,
  selectFeedSessionItems,
  selectFeedFollowing,
  selectFeedFollowers,
  selectFeedFollowRequests,
  selectFeedIdentityRemote,
  selectOwnFeedUserId,
  selectReceivedReactionsByEvent,
  selectSentReactionsByEvent,
} = feedSlice.selectors;

export const initializeFeedStateSlice = createAction('initializeFeedStateSlice');

export function getFeedShareUrl(identity: FeedIdentity) {
  return `https://app.liftlog.online/feed/share?id=${identity.lookup}${
    identity.name ? `&name=${encodeURIComponent(identity.name)}` : ''
  }`;
}

type FeedAction = {
  fromUserAction: boolean;
};

export const createFeedIdentity = createAction<
  {
    name: string | undefined;
    publishBodyweight: boolean;
    publishPlan: boolean;
    publishWorkouts: boolean;
  } & FeedAction
>('createFeedIdentity');

export const fetchFeedItems = createAction<FeedAction>('fetchFeedItems');

export const fetchInboxItems = createAction<FeedAction>('fetchInboxItems');

export const encryptAndShare = createAction<{
  item: SharedItem;
  title: string;
}>('encryptAndShare');

export const fetchSharedItem = createAction<{ id: string; key: AesKey }>('fetchSharedItem');

export const feedApiError = createAction<{
  message: string;
  error: ApiError;
  action: PayloadAction<FeedAction>;
}>('feedApiError');

export const fetchAndSetSharedFeedUser = createAction<{ idOrLookup: string; name?: string } & FeedAction>(
  'fetchAndSetSharedFeedUser',
);

export const requestFollowUser = createAction<{ user: FeedUser } & FeedAction>('requestFollowUser');

export const processFollowResponses = createAction<{
  responses: FollowResponseInboxMessage[];
}>('processFollowResponses');

export const unfollowFeedUser = createAction<{ feedUser: FeedUser }>('unfollowFeedUser');

export const addUnpublishedSessionId = createAction<string>('addUnpublishedSessionId');
export const removeUnpublishedSessionId = createAction<string>('removeUnpublishedSessionId');

export const acceptFollowRequest = createAction<{ request: FollowRequestInboxMessage } & FeedAction>(
  'acceptFollowRequest',
);

export const denyFollowRequest = createAction<{ request: FollowRequestInboxMessage } & FeedAction>('denyFollowRequest');

export const revokeFollowSecretAndRemoveFollower = createAction<{ userId: string } & FeedAction>('startRemoveFollower');

export const revokeFollowSecrets = createAction<FeedAction>('revokeFollowSecrets');

export const publishUnpublishedSessions = createAction('publishUnpublishedSessions');

export const resetFeedAccount = createAction<FeedAction & { newIdentity?: FeedIdentity; createNewIdentity?: false }>(
  'resetFeedAccount',
);

export const updateFeedIdentity = createAction<{ updates: Partial<FeedIdentity> } & FeedAction>('updateFeedIdentity');

/** One tap. Taps are coalesced in the effect, so a flurry of them becomes a single encrypted message. */
export const cheerFeedItem = createAction<{ eventId: string; emoji: ReactionEmoji } & FeedAction>('cheerFeedItem');

export default feedSlice.reducer;
