import { AesKey } from '@/models/encryption-models';
import {
  FeedIdentity,
  Friend,
  LiveSessionUserEvent,
  ReactionEmoji,
  ReceivedReaction,
  SentReaction,
  SessionUserEvent,
  SharedFeedUser,
  SharedItem,
} from '@/models/feed-models';
import { RemoteData } from '@/models/remote';
import { FeedBackupData } from '@/models/backup';
import { ApiError } from '@/services/api-error';
import type { FeedHubLease } from '@/services/feed-hub-service';
import { LiveFrameResponse } from '@/models/feed-api-models';
import { createAction, createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';

type FeedState = {
  isHydrated: boolean;
  identity: RemoteData<FeedIdentity>;
  feed: SessionUserEvent[];
  /** Friends' workouts in progress, as the feed hub last sent them. Never persisted. */
  liveSessions: LiveSessionUserEvent[];
  friends: Record<string, Friend>;
  sharedFeedUser: RemoteData<SharedFeedUser>;
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
  liveSessions: [],
  friends: {},
  sharedFeedUser: RemoteData.notAsked(),
  revokedFollowSecrets: [],
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
    putFriends(state, action: PayloadAction<Friend[]>) {
      for (const friend of action.payload) {
        state.friends[friend.id] = friend;
      }
    },
    removeFriends(state, action: PayloadAction<string[]>) {
      for (const id of action.payload) {
        delete state.friends[id];
      }
    },
    patchFriendProfiles(state, action: PayloadAction<{ id: string; name: string | undefined }[]>) {
      for (const { id, name } of action.payload) {
        const friend = state.friends[id];
        if (friend) {
          state.friends[id] = friend.with({ name });
        }
      }
    },
    setSharedFeedUser(state, action: PayloadAction<RemoteData<SharedFeedUser>>) {
      state.sharedFeedUser = action.payload;
    },
    setSharedItem(state, action: PayloadAction<RemoteData<SharedItem>>) {
      state.sharedItem = action.payload;
    },
    setIsFetching(state, action: PayloadAction<boolean>) {
      state.isFetching = action.payload;
    },
    upsertFeedItems(state, action: PayloadAction<SessionUserEvent[]>) {
      const ids = action.payload.map((x) => x.id);
      state.feed = state.feed.filter((x) => !ids.includes(x.id)).concat(action.payload);
    },
    removeFeedItems(state, action: PayloadAction<string[]>) {
      state.feed = state.feed.filter((x) => !action.payload.includes(x.id));
    },
    setLiveSessions(state, action: PayloadAction<LiveSessionUserEvent[]>) {
      state.liveSessions = action.payload;
    },
    upsertLiveSession(state, action: PayloadAction<LiveSessionUserEvent>) {
      state.liveSessions = state.liveSessions.filter((x) => x.userId !== action.payload.userId).concat(action.payload);
    },
    removeLiveSession(state, action: PayloadAction<{ userId: string; eventId: string }>) {
      state.liveSessions = state.liveSessions.filter(
        (x) => !(x.userId === action.payload.userId && x.eventId === action.payload.eventId),
      );
    },
    queueFollowSecretRevocations(state, action: PayloadAction<string[]>) {
      state.revokedFollowSecrets = [...new Set([...state.revokedFollowSecrets, ...action.payload])];
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
    selectFriendList: createSelector(
      (state: FeedState) => state.friends,
      (x) => Object.values(x),
    ),
    selectAcceptedFriends: createSelector(
      (state: FeedState) => state.friends,
      (x) => Object.values(x).filter((friend) => friend.status === 'friend'),
    ),
    selectIncomingFriendRequestCount: createSelector(
      (state: FeedState) => state.friends,
      (x) => Object.values(x).filter((friend) => friend.status === 'incoming').length,
    ),
    selectFeedSessionItems: (state: FeedState) => state.feed,
    selectLiveSessions: (state: FeedState) => state.liveSessions,
    selectFeedIdentityRemote: (state: FeedState) => state.identity,
    selectOwnFeedUserId: (state: FeedState) => state.identity.unwrapOr(undefined)?.id,
    selectSharingLive: (state: FeedState) => !!state.identity.unwrapOr(undefined)?.sharesLiveWorkouts,
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
  setSharedItem,
  setIsFetching,
  putFriends,
  removeFriends,
  patchFriendProfiles,
  upsertFeedItems,
  queueFollowSecretRevocations,
  removeRevokableFollowSecret,
  removeFeedItems,
  setLiveSessions,
  upsertLiveSession,
  removeLiveSession,
  upsertReceivedReactions,
  setSentReaction,
  removeSentReaction,
  removeReactionsForEvents,
} = feedSlice.actions;

export const {
  selectSharedFeedUser,
  selectSharedItem,
  selectFeedSessionItems,
  selectLiveSessions,
  selectFriendList,
  selectAcceptedFriends,
  selectIncomingFriendRequestCount,
  selectFeedIdentityRemote,
  selectOwnFeedUserId,
  selectSharingLive,
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
    publishWorkouts: boolean;
    shareLiveWorkouts?: boolean;
  } & FeedAction
>('createFeedIdentity');

export const fetchFeedItems = createAction<FeedAction>('fetchFeedItems');

/** `inboxOnly` skips refreshing the feed afterwards, for fetches that are only waiting on messages such as cheers. */
export const fetchInboxItems = createAction<FeedAction & { inboxOnly?: boolean }>('fetchInboxItems');

export const flushOutbox = createAction('flushOutbox');

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

export const requestFriend = createAction<{ user: SharedFeedUser } & FeedAction>('requestFriend');

export const acceptFriendRequest = createAction<{ friendId: string } & FeedAction>('acceptFriendRequest');

export const denyFriendRequest = createAction<{ friendId: string } & FeedAction>('denyFriendRequest');

export const shareBackWithFriend = createAction<{ friendId: string } & FeedAction>('shareBackWithFriend');

export const removeFriend = createAction<{ friendId: string; notify: boolean } & FeedAction>('removeFriend');

export const rejectLegacyFollowRequests = createAction('rejectLegacyFollowRequests');

export const rotateFeedKey = createAction('rotateFeedKey');

export const repairFriends = createAction<{ undecryptable: string[] }>('repairFriends');

export const restoreFeedBackup = createAction<FeedBackupData & FeedAction>('restoreFeedBackup');

export const addUnpublishedSessionId = createAction<string>('addUnpublishedSessionId');
export const removeUnpublishedSessionId = createAction<string>('removeUnpublishedSessionId');

export const revokeFollowSecrets = createAction<FeedAction>('revokeFollowSecrets');

export const publishUnpublishedSessions = createAction('publishUnpublishedSessions');

export const resetFeedAccount = createAction<FeedAction & { newIdentity?: FeedIdentity; createNewIdentity?: false }>(
  'resetFeedAccount',
);

export const updateFeedIdentity = createAction<{ updates: Partial<FeedIdentity> } & FeedAction>('updateFeedIdentity');

export const acquireFeedHubLease = createAction<FeedHubLease>('acquireFeedHubLease');
export const releaseFeedHubLease = createAction<FeedHubLease>('releaseFeedHubLease');
export const feedHubConnected = createAction('feedHubConnected');
export const watchLiveSessions = createAction('watchLiveSessions');
export const liveFrameReceived = createAction<LiveFrameResponse>('liveFrameReceived');
export const liveFrameEnded = createAction<{ userId: string; eventId: string }>('liveFrameEnded');
export const inboxNudged = createAction('inboxNudged');

/** One tap. Taps are coalesced in the effect, so a flurry of them becomes a single encrypted message. */
export const cheerFeedItem = createAction<{ eventId: string; emoji: ReactionEmoji } & FeedAction>('cheerFeedItem');

export default feedSlice.reducer;
