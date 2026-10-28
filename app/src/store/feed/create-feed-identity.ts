import { FeedIdentity } from '@/models/feed-models';
import { RemoteData } from '@/models/remote';
import { FeedIdentityService } from '@/services/feed-identity-service';
import { AppDispatch, RootState } from '@/store/store';
import { createFeedIdentity, feedApiError, setIdentity } from '@/store/feed';
import { PayloadAction } from '@reduxjs/toolkit';

export async function createAndStoreFeedIdentity(
  action: PayloadAction<{ fromUserAction: boolean }>,
  profile: Omit<ReturnType<typeof createFeedIdentity>['payload'], 'fromUserAction'>,
  {
    dispatch,
    getState,
    feedIdentityService,
  }: { dispatch: AppDispatch; getState: () => RootState; feedIdentityService: FeedIdentityService },
): Promise<FeedIdentity | undefined> {
  if (getState().feed.identity.isLoading()) {
    return undefined;
  }
  dispatch(setIdentity(RemoteData.loading()));
  const result = await feedIdentityService.createFeedIdentityAsync(
    profile.name,
    profile.publishBodyweight,
    profile.publishWorkouts,
    profile.shareLiveWorkouts,
  );
  if (!result.isSuccess()) {
    dispatch(feedApiError({ message: 'Failed to create user', error: result.error!, action }));
    dispatch(setIdentity(RemoteData.error(result.error)));
    return undefined;
  }
  dispatch(setIdentity(RemoteData.success(result.data)));
  return result.data;
}
