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
  activeTab: string;
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
  activeTab: 'mainfeed-panel',
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
    setActiveTab(state, action: PayloadAction<string>) {
      state.activeTab = action.payload;
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

// TODO handle
export const fetchFeedItems = createAction<FeedAction>('fetchFeedItems');
// TODO handle
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

export default feedSlice.reducer;
