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
import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';

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
};

const initialState: FeedState = {
  isHydrated: false,
  identity: RemoteData.notAsked(),
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
    setSharedItem(state, action: PayloadAction<RemoteData<SharedItem>>) {
      state.sharedItem = action.payload.map((x) => x.toPOJO());
    },
  },
});

export const {
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
} = feedSlice.actions;

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

export const fetchInboxItemsAction = createAction<FeedAction>(
  'fetchInboxItemsAction',
);

export const encryptAndShare = createAction<SharedItem>('encryptAndShare');

export const feedApiError = createAction<{
  message: string;
  error: ApiError;
  action: PayloadAction<FeedAction>;
}>('feedApiError');

export default feedSlice.reducer;
