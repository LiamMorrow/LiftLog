import { AesKey } from '@/models/encryption-models';
import {
  FeedIdentity,
  FeedIdentityPOJO,
  FeedItem,
  FeedItemPOJO,
  FeedUser,
  FeedUserPOJO,
  FollowRequest,
  FollowRequestPOJO,
  SharedItem,
  SharedItemPOJO,
} from '@/models/feed-models';
import { RemoteData } from '@/models/remote';
import { ApiError } from '@/services/feed-api';
import {
  createAction,
  createSelector,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit';

export type FeedState = {
  isHydrated: boolean;
  identity: RemoteData<FeedIdentityPOJO>;
  feed: FeedItemPOJO[];
  followedUsers: Record<string, FeedUserPOJO>;
  sharedFeedUser: RemoteData<FeedUserPOJO>;
  followRequests: FollowRequestPOJO[];
  followers: Record<string, FeedUserPOJO>;
  unpublishedSessionIds: string[];
  sharedItem: RemoteData<SharedItemPOJO>;
  isFetching: boolean;
};

const initialState: FeedState = {
  isHydrated: false,
  identity: RemoteData.notAsked(),
  isFetching: false,
  feed: [],
  followedUsers: {},
  sharedFeedUser: RemoteData.notAsked(),
  followRequests: [],
  followers: {},
  unpublishedSessionIds: [],
  sharedItem: RemoteData.notAsked(),
};

const feedSlice = createSlice({
  name: 'feed',
  initialState,
  reducers: {
    patchFeedState(state, action: PayloadAction<Partial<FeedState>>) {
      Object.assign(state, action.payload);
    },
    setIsHydrated(state, action: PayloadAction<boolean>) {
      state.isHydrated = action.payload;
    },
    setIdentity(state, action: PayloadAction<RemoteData<FeedIdentity>>) {
      state.identity = action.payload?.map((x) => x.toPOJO());
    },
    setFeed(state, action: PayloadAction<FeedItem[]>) {
      state.feed = action.payload.map((x) => x.toPOJO());
    },
    setFollowedUsers(state, action: PayloadAction<Record<string, FeedUser>>) {
      state.followedUsers = Object.fromEntries(
        Object.entries(action.payload).map((x) => [x[0], x[1].toPOJO()]),
      );
    },
    setSharedFeedUser(state, action: PayloadAction<RemoteData<FeedUser>>) {
      state.sharedFeedUser = action.payload.map((x) => x.toPOJO());
    },
    setFollowRequests(state, action: PayloadAction<FollowRequest[]>) {
      state.followRequests = action.payload.map((x) => x.toPOJO());
    },
    setFollowers(state, action: PayloadAction<Record<string, FeedUser>>) {
      state.followers = Object.fromEntries(
        Object.entries(action.payload).map((x) => [x[0], x[1].toPOJO()]),
      );
    },
    setUnpublishedSessionIds(state, action: PayloadAction<string[]>) {
      state.unpublishedSessionIds = action.payload;
    },
    addUnpublishedSessionId(state, action: PayloadAction<string>) {
      if (!state.unpublishedSessionIds.includes(action.payload)) {
        state.unpublishedSessionIds.push(action.payload);
      }
    },
    setSharedItem(state, action: PayloadAction<RemoteData<SharedItem>>) {
      state.sharedItem = action.payload.map((x) => x.toPOJO());
    },
    setIsFetching(state, action: PayloadAction<boolean>) {
      state.isFetching = action.payload;
    },
    addFollower(state, action: PayloadAction<FeedUser>) {
      state.followers[action.payload.id] = action.payload.toPOJO();
    },
    removeFollower(state, action: PayloadAction<FeedUser>) {
      delete state.followers[action.payload.id];
    },
    removeFollowRequest(state, action: PayloadAction<FollowRequest>) {
      state.followRequests = state.followRequests.filter(
        (req) => req.userId !== action.payload.userId,
      );
    },
    replaceFeedFollowedUsers(state, action: PayloadAction<FeedUser[]>) {
      state.followedUsers = Object.fromEntries(
        action.payload.map((user) => [user.id, user.toPOJO()]),
      );
    },
    putFollowedUser(state, action: PayloadAction<FeedUser>) {
      state.followedUsers[action.payload.id] = action.payload.toPOJO();
    },
    replaceFeedItems(state, action: PayloadAction<FeedItem[]>) {
      state.feed = action.payload.map((item) => item.toPOJO());
    },
    removeUnpublishedSessionId(state, action: PayloadAction<string>) {
      state.unpublishedSessionIds = state.unpublishedSessionIds.filter(
        (id) => id !== action.payload,
      );
    },
  },
  selectors: {
    selectSharedItem: createSelector(
      (state: FeedState) => state.sharedItem,
      (sharedItem) => sharedItem.map(SharedItem.fromPOJO),
    ),
    selectFollowRequestCount: createSelector(
      (state: FeedState) => state.followRequests,
      (x) => x.length,
    ),
    selectFeedFollowRequests: createSelector(
      (state: FeedState) => state.followRequests,
      (x) => x.map(FollowRequest.fromPOJO),
    ),
    selectFeedFollowers: createSelector(
      (state: FeedState) => state.followers,
      (x) =>
        Object.entries(x).map(([userId, user]) => ({
          userId,
          user: FeedUser.fromPOJO(user),
        })),
    ),
    selectFeedFollowing: createSelector(
      (state: FeedState) => state.followedUsers,
      (x) =>
        Object.entries(x).map(([userId, user]) => ({
          userId,
          user: FeedUser.fromPOJO(user),
        })),
    ),
    selectFeedSessionItems: createSelector(
      (state: FeedState) => state.feed,
      (x) =>
        x
          .filter((y) => y._BRAND === 'SESSION_FEED_ITEM_POJO')
          .map(FeedItem.fromPOJO),
    ),
    selectFeedIdentityRemote: createSelector(
      (state: FeedState) => state.identity,
      (x) => x.map(FeedIdentity.fromPOJO),
    ),
  },
});

export const {
  patchFeedState,
  setIsHydrated,
  setIdentity,
  setFeed,
  setFollowedUsers,
  setSharedFeedUser,
  setFollowRequests,
  setFollowers,
  setActiveTab,
  setUnpublishedSessionIds,
  setSharedItem,
  addUnpublishedSessionId,
  setIsFetching,
  addFollower,
  removeFollower,
  removeFollowRequest,
  replaceFeedFollowedUsers,
  putFollowedUser,
  replaceFeedItems,
  removeUnpublishedSessionId,
} = feedSlice.actions;

export const {
  selectSharedItem,
  selectFollowRequestCount,
  selectFeedSessionItems,
  selectFeedFollowing,
  selectFeedFollowers,
  selectFeedFollowRequests,
  selectFeedIdentityRemote,
} = feedSlice.selectors;

export const initializeFeedStateSlice = createAction(
  'initializeFeedStateSlice',
);

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

export const encryptAndShare = createAction<SharedItem>('encryptAndShare');

export const fetchSharedItem = createAction<{ id: string; key: AesKey }>(
  'fetchSharedItem',
);

export const feedApiError = createAction<{
  message: string;
  error: ApiError;
  action: PayloadAction<FeedAction>;
}>('feedApiError');

export const fetchAndSetSharedFeedUser = createAction<
  { idOrLookup: string; name?: string } & FeedAction
>('fetchAndSetSharedFeedUser');

export const requestFollowUser = createAction<FeedAction>('requestFollowUser');

export const processFollowResponses = createAction<{
  responses: {
    userId: string;
    accepted: boolean;
    aesKey: AesKey | null;
    followSecret: string | null | undefined;
  }[];
}>('processFollowResponses');

export const unfollowFeedUser = createAction<{ feedUser: FeedUser }>(
  'unfollowFeedUser',
);

export const acceptFollowRequest = createAction<
  { request: FollowRequest } & FeedAction
>('acceptFollowRequest');

export const denyFollowRequest = createAction<
  { request: FollowRequest } & FeedAction
>('denyFollowRequest');

export const startRemoveFollower = createAction<
  { user: FeedUser } & FeedAction
>('startRemoveFollower');

export const publishUnpublishedSessions = createAction(
  'publishUnpublishedSessions',
);

export const resetFeedAccount = createAction<FeedAction>('resetFeedAccount');

export default feedSlice.reducer;
