import { describe, expect, it, vi } from 'vitest';
import { combineReducers } from '@reduxjs/toolkit';
import { createAddEffectTestBed } from '@/utils/__test__/add-effect-testbed';
import { addFollowingEffects } from '@/store/feed/following-effects';
import feedReducer, {
  acceptFollowRequest,
  addFollower,
  addRevokableFollowSecret,
  denyFollowRequest,
  feedApiError,
  fetchAndSetSharedFeedUser,
  fetchFeedItems,
  processFollowResponses,
  putFollowedUser,
  removeFollowedUser,
  removeFollower,
  removeFollowRequest,
  removeRevokableFollowSecret,
  requestFollowUser,
  revokeFollowSecretAndRemoveFollower,
  revokeFollowSecrets,
  setSharedFeedUser,
  unfollowFeedUser,
} from '@/store/feed';
import { RootState } from '@/store/store';
import {
  AcceptedFollowResponse,
  FeedIdentity,
  FollowedFeedUser,
  FollowerFeedUser,
  FollowRequest,
  FollowRequestInboxMessage,
  FollowResponse,
  FollowResponseInboxMessage,
  PendingFeedUser,
  RejectedFollowResponse,
} from '@/models/feed-models';
import { RemoteData } from '@/models/remote';
import { AesKey, RsaPublicKey } from '@/models/encryption-models';
import { ApiResult, ApiError, ApiErrorType } from '@/services/api-error';
import { GetUserResponse } from '@/models/feed-api-models';

// ─── Fixtures ───────────────────────────────────────────────────────────────

const publicKey: RsaPublicKey = { spkiPublicKeyBytes: new Uint8Array([1, 2, 3]) };
const aesKey = {} as AesKey;
const identity = {} as FeedIdentity;

function apiError(type: ApiErrorType = ApiErrorType.Unknown): ApiError {
  return { type, message: 'boom', exception: undefined };
}

function userResponse(id: string): GetUserResponse {
  return { id, rsaPublicKey: publicKey.spkiPublicKeyBytes } as GetUserResponse;
}

function followRequest(senderUserId: string, name?: string): FollowRequestInboxMessage {
  return new FollowRequestInboxMessage(senderUserId, new Uint8Array(), new FollowRequest(name));
}

function acceptedResponse(senderUserId: string): FollowResponseInboxMessage {
  return new FollowResponseInboxMessage(
    senderUserId,
    new Uint8Array(),
    new FollowResponse(new AcceptedFollowResponse(aesKey, `secret-${senderUserId}`)),
  );
}

function rejectedResponse(senderUserId: string): FollowResponseInboxMessage {
  return new FollowResponseInboxMessage(
    senderUserId,
    new Uint8Array(),
    new FollowResponse(new RejectedFollowResponse()),
  );
}

type FeedStateShape = Partial<RootState['feed']>;

function stateWith(feed: FeedStateShape): { feed: FeedStateShape } {
  return {
    feed: {
      identity: RemoteData.success(identity),
      sharedFeedUser: RemoteData.notAsked(),
      followedUsers: {},
      followers: {},
      revokedFollowSecrets: [],
      ...feed,
    },
  };
}

function defaultServices() {
  return {
    feedApiService: {
      getUserAsync: vi.fn<(id: string) => Promise<ApiResult<GetUserResponse>>>(),
    },
    feedFollowService: {
      requestToFollowAUserAsync: vi.fn().mockResolvedValue(ApiResult.success()),
      unfollowUserAsync: vi.fn().mockResolvedValue(ApiResult.success()),
      acceptFollowRequestAsync: vi.fn().mockResolvedValue(ApiResult.success('follow-secret')),
      denyFollowRequestAsync: vi.fn().mockResolvedValue(ApiResult.success()),
      revokeFollowSecretAsync: vi.fn().mockResolvedValue(ApiResult.success()),
    },
  };
}

const rootReducer = combineReducers({ feed: feedReducer });

function makeTestBed(feed: FeedStateShape, services = defaultServices()) {
  const testBed = createAddEffectTestBed({
    initialState: stateWith(feed) as never,
    services: services as never,
    reducer: rootReducer,
  });
  addFollowingEffects(testBed.addEffect);
  return { testBed, services };
}

function feedState(testBed: ReturnType<typeof makeTestBed>['testBed']) {
  return testBed.getState().feed;
}

function sharedFeedUserPayloads(testBed: ReturnType<typeof makeTestBed>['testBed']): RemoteData<PendingFeedUser>[] {
  return testBed.dispatchedActions
    .filter((a) => a.type === setSharedFeedUser.type)
    .map((a) => (a as unknown as { payload: RemoteData<PendingFeedUser> }).payload);
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('following-effects', () => {
  describe('fetchAndSetSharedFeedUser', () => {
    it('sets loading then a pending user on success', async () => {
      const { testBed, services } = makeTestBed({});
      services.feedApiService.getUserAsync.mockResolvedValue(ApiResult.success(userResponse('u1')));

      await testBed.dispatchHandled(fetchAndSetSharedFeedUser({ idOrLookup: 'u1', name: 'Bob', fromUserAction: true }));

      const shared = sharedFeedUserPayloads(testBed);
      expect(shared[0]!.isLoading()).toBe(true);
      const success = shared[1]!;
      expect(success.isSuccess()).toBe(true);
      const user = success.unwrapOr(undefined);
      expect(user).toBeInstanceOf(PendingFeedUser);
      expect(user?.id).toBe('u1');
      expect(user?.name).toBe('Bob');
    });

    it('dispatches feedApiError and an error state on failure', async () => {
      const { testBed, services } = makeTestBed({});
      services.feedApiService.getUserAsync.mockResolvedValue(ApiResult.fromError(apiError()));

      await testBed.dispatchHandled(fetchAndSetSharedFeedUser({ idOrLookup: 'u1', fromUserAction: true }));

      expect(testBed.getDispatchedAction(feedApiError).payload.message).toBe('Failed to fetch user');
      const shared = sharedFeedUserPayloads(testBed);
      expect(shared.at(-1)!.match({ loading: () => false, success: () => false, error: () => true })).toBe(true);
    });
  });

  describe('requestFollowUser', () => {
    it('does nothing when identity is not loaded', async () => {
      const { testBed, services } = makeTestBed({ identity: RemoteData.notAsked() });

      await testBed.dispatchHandled(
        requestFollowUser({ user: new PendingFeedUser('u1', publicKey, 'Bob'), fromUserAction: true }),
      );

      expect(services.feedFollowService.requestToFollowAUserAsync).not.toHaveBeenCalled();
      testBed.expectNotDispatched(putFollowedUser);
    });

    it('follows the requested user and resets the shared slot on success', async () => {
      const sharedUser = new PendingFeedUser('u1', publicKey, 'Bob');
      const { testBed } = makeTestBed({ sharedFeedUser: RemoteData.success(sharedUser) });

      await testBed.dispatchHandled(requestFollowUser({ user: sharedUser, fromUserAction: true }));

      const put = testBed.getDispatchedAction(putFollowedUser).payload;
      expect(put).toBeInstanceOf(PendingFeedUser);
      expect(put.id).toBe('u1');
      expect(put.name).toBe('Bob');
      expect(
        testBed
          .getDispatchedAction(setSharedFeedUser)
          .payload.match({ loading: () => false, success: () => false, error: () => false, notAsked: () => true }),
      ).toBe(true);
    });

    it('follows a follower back as a pending user, without their follow secret', async () => {
      const follower = new FollowerFeedUser('u1', publicKey, 'Bob', 'their-secret-to-read-my-feed');
      const { testBed, services } = makeTestBed({ followers: { u1: follower } });

      await testBed.dispatchHandled(requestFollowUser({ user: follower, fromUserAction: true }));

      expect(services.feedFollowService.requestToFollowAUserAsync).toHaveBeenCalledWith(identity, follower);

      const put = testBed.getDispatchedAction(putFollowedUser).payload;
      expect(put).toBeInstanceOf(PendingFeedUser);
      expect(put).not.toHaveProperty('followSecret');
      expect(put.publicKey).toBe(publicKey);

      // They stay a follower; following back is a separate, still-pending grant.
      expect(feedState(testBed).followers.u1).toBe(follower);
      expect(feedState(testBed).followedUsers.u1).toBeInstanceOf(PendingFeedUser);
    });

    it('reports an error and does not follow when the request fails', async () => {
      const sharedUser = new PendingFeedUser('u1', publicKey, 'Bob');
      const services = defaultServices();
      services.feedFollowService.requestToFollowAUserAsync.mockResolvedValue(ApiResult.fromError(apiError()));
      const { testBed } = makeTestBed({ sharedFeedUser: RemoteData.success(sharedUser) }, services);

      await testBed.dispatchHandled(requestFollowUser({ user: sharedUser, fromUserAction: true }));

      expect(testBed.getDispatchedAction(feedApiError).payload.message).toBe('Failed to request follow user');
      testBed.expectNotDispatched(putFollowedUser);
    });
  });

  describe('processFollowResponses', () => {
    it('upgrades accepted responses for known users to followed users', async () => {
      const existing = new PendingFeedUser('u1', publicKey, 'Bob');
      const { testBed } = makeTestBed({ followedUsers: { u1: existing } });

      await testBed.dispatchHandled(processFollowResponses({ responses: [acceptedResponse('u1')] }));

      const put = testBed.getDispatchedAction(putFollowedUser).payload as FollowedFeedUser;
      expect(put).toBeInstanceOf(FollowedFeedUser);
      expect(put.id).toBe('u1');
      expect(put.followSecret).toBe('secret-u1');

      const stored = feedState(testBed).followedUsers.u1;
      expect(stored).toBeInstanceOf(FollowedFeedUser);
      expect((stored as FollowedFeedUser).followSecret).toBe('secret-u1');
    });

    it('ignores accepted responses for unknown users', async () => {
      const { testBed } = makeTestBed({ followedUsers: {} });

      await testBed.dispatchHandled(processFollowResponses({ responses: [acceptedResponse('ghost')] }));

      testBed.expectNotDispatched(putFollowedUser);
    });

    it('removes users that rejected the request and always refetches the feed', async () => {
      const { testBed } = makeTestBed({ followedUsers: {} });

      await testBed.dispatchHandled(processFollowResponses({ responses: [rejectedResponse('u2')] }));

      expect(testBed.getDispatchedAction(removeFollowedUser).payload).toBe('u2');
      expect(testBed.getDispatchedAction(fetchFeedItems).payload.fromUserAction).toBe(false);
    });
  });

  describe('unfollowFeedUser', () => {
    it('does nothing when identity is not loaded', async () => {
      const { testBed } = makeTestBed({ identity: RemoteData.notAsked() });

      await testBed.dispatchHandled(unfollowFeedUser({ feedUser: new PendingFeedUser('u1', publicKey, 'Bob') }));

      testBed.expectNotDispatched(removeFollowedUser);
    });

    it('removes a pending user locally without calling the server', async () => {
      const { testBed, services } = makeTestBed({});

      await testBed.dispatchHandled(unfollowFeedUser({ feedUser: new PendingFeedUser('u1', publicKey, 'Bob') }));

      expect(testBed.getDispatchedAction(removeFollowedUser).payload).toBe('u1');
      expect(services.feedFollowService.unfollowUserAsync).not.toHaveBeenCalled();
    });

    it('notifies the server when unfollowing a followed user', async () => {
      const followed = new FollowedFeedUser('u1', publicKey, 'Bob', undefined, aesKey, 'secret');
      const { testBed, services } = makeTestBed({ followedUsers: { u1: followed } });

      await testBed.dispatchHandled(unfollowFeedUser({ feedUser: followed }));

      expect(feedState(testBed).followedUsers.u1).toBeUndefined();

      expect(testBed.getDispatchedAction(removeFollowedUser).payload).toBe('u1');
      expect(services.feedFollowService.unfollowUserAsync).toHaveBeenCalledWith(identity, followed);
    });
  });

  describe('acceptFollowRequest', () => {
    it('revokes an existing follower secret before accepting', async () => {
      const services = defaultServices();
      services.feedApiService.getUserAsync.mockResolvedValue(ApiResult.success(userResponse('u1')));
      const existingFollower = new FollowerFeedUser('u1', publicKey, 'Bob', 'old-secret');
      const request = followRequest('u1', 'Bob');
      const { testBed } = makeTestBed({ followers: { u1: existingFollower }, followRequests: [request] }, services);

      await testBed.dispatchHandled(acceptFollowRequest({ request, fromUserAction: true }));

      expect(services.feedFollowService.revokeFollowSecretAsync).toHaveBeenCalledWith(identity, 'old-secret');
      expect(testBed.getDispatchedAction(addFollower).payload).toBeInstanceOf(FollowerFeedUser);
      expect(testBed.getDispatchedAction(removeFollowRequest).payload.senderUserId).toBe('u1');

      expect(feedState(testBed).followers.u1!.followSecret).toBe('follow-secret');
      expect(feedState(testBed).followRequests).toHaveLength(0);
    });

    it('reports an error and adds no follower when the user lookup fails', async () => {
      const services = defaultServices();
      services.feedApiService.getUserAsync.mockResolvedValue(ApiResult.fromError(apiError()));
      const { testBed } = makeTestBed({}, services);

      await testBed.dispatchHandled(acceptFollowRequest({ request: followRequest('u1'), fromUserAction: true }));

      expect(testBed.getDispatchedAction(feedApiError).payload.message).toBe('Failed to fetch user');
      testBed.expectNotDispatched(addFollower);
    });

    it('reports an error when accepting the request fails', async () => {
      const services = defaultServices();
      services.feedApiService.getUserAsync.mockResolvedValue(ApiResult.success(userResponse('u1')));
      services.feedFollowService.acceptFollowRequestAsync.mockResolvedValue(ApiResult.fromError(apiError()));
      const { testBed } = makeTestBed({}, services);

      await testBed.dispatchHandled(acceptFollowRequest({ request: followRequest('u1'), fromUserAction: true }));

      expect(testBed.getDispatchedAction(feedApiError).payload.message).toBe('Failed to accept follow request');
      testBed.expectNotDispatched(addFollower);
    });
  });

  describe('denyFollowRequest', () => {
    it('removes the request even when the user lookup fails', async () => {
      const services = defaultServices();
      services.feedApiService.getUserAsync.mockResolvedValue(ApiResult.fromError(apiError()));
      const { testBed } = makeTestBed({}, services);

      await testBed.dispatchHandled(denyFollowRequest({ request: followRequest('u1'), fromUserAction: true }));

      expect(services.feedFollowService.denyFollowRequestAsync).not.toHaveBeenCalled();
      expect(testBed.getDispatchedAction(removeFollowRequest).payload.senderUserId).toBe('u1');
    });

    it('removes the request after a successful deny', async () => {
      const services = defaultServices();
      services.feedApiService.getUserAsync.mockResolvedValue(ApiResult.success(userResponse('u1')));
      const { testBed } = makeTestBed({}, services);

      await testBed.dispatchHandled(denyFollowRequest({ request: followRequest('u1'), fromUserAction: true }));

      expect(services.feedFollowService.denyFollowRequestAsync).toHaveBeenCalled();
      expect(testBed.getDispatchedAction(removeFollowRequest).payload.senderUserId).toBe('u1');
    });

    it('treats a NotFound deny as success without logging an error', async () => {
      const services = defaultServices();
      services.feedApiService.getUserAsync.mockResolvedValue(ApiResult.success(userResponse('u1')));
      services.feedFollowService.denyFollowRequestAsync.mockResolvedValue(
        ApiResult.fromError(apiError(ApiErrorType.NotFound)),
      );
      const { testBed } = makeTestBed({}, services);

      await testBed.dispatchHandled(denyFollowRequest({ request: followRequest('u1'), fromUserAction: true }));

      expect(testBed.mockServices.logger.error).not.toHaveBeenCalled();
      expect(testBed.getDispatchedAction(removeFollowRequest).payload.senderUserId).toBe('u1');
    });
  });

  describe('revokeFollowSecretAndRemoveFollower', () => {
    it('queues the secret for revocation and removes the follower', async () => {
      const follower = new FollowerFeedUser('u1', publicKey, 'Bob', 'the-secret');
      const { testBed } = makeTestBed({ followers: { u1: follower } });

      await testBed.dispatchHandled(revokeFollowSecretAndRemoveFollower({ userId: 'u1', fromUserAction: true }));

      expect(testBed.getDispatchedAction(addRevokableFollowSecret).payload).toBe('the-secret');
      expect(testBed.getDispatchedAction(removeFollower).payload).toBe('u1');
      testBed.getDispatchedAction(revokeFollowSecrets);

      expect(feedState(testBed).followers.u1).toBeUndefined();
      expect(feedState(testBed).revokedFollowSecrets).toEqual(['the-secret']);
    });

    it('removes the follower without queuing when there is no secret', async () => {
      const follower = new FollowerFeedUser('u1', publicKey, 'Bob', '');
      const { testBed } = makeTestBed({ followers: { u1: follower } });

      await testBed.dispatchHandled(revokeFollowSecretAndRemoveFollower({ userId: 'u1', fromUserAction: true }));

      testBed.expectNotDispatched(addRevokableFollowSecret);
      expect(testBed.getDispatchedAction(removeFollower).payload).toBe('u1');
    });
  });

  describe('revokeFollowSecrets', () => {
    it('does nothing when there are no queued secrets', async () => {
      const { testBed, services } = makeTestBed({ revokedFollowSecrets: [] });

      await testBed.dispatchHandled(revokeFollowSecrets({ fromUserAction: true }));

      expect(services.feedFollowService.revokeFollowSecretAsync).not.toHaveBeenCalled();
    });

    it('revokes each queued secret and clears it on success', async () => {
      const { testBed } = makeTestBed({ revokedFollowSecrets: ['a', 'b'] });

      await testBed.dispatchHandled(revokeFollowSecrets({ fromUserAction: true }));

      const removed = testBed.dispatchedActions
        .filter((x) => x.type === removeRevokableFollowSecret.type)
        .map((x) => x.payload);
      expect(removed).toEqual(['a', 'b']);
      expect(feedState(testBed).revokedFollowSecrets).toEqual([]);
    });

    it('treats Unauthorized and NotFound as already-revoked', async () => {
      const services = defaultServices();
      services.feedFollowService.revokeFollowSecretAsync.mockResolvedValue(
        ApiResult.fromError(apiError(ApiErrorType.Unauthorized)),
      );
      const { testBed } = makeTestBed({ revokedFollowSecrets: ['a'] }, services);

      await testBed.dispatchHandled(revokeFollowSecrets({ fromUserAction: true }));

      expect(testBed.getDispatchedAction(removeRevokableFollowSecret).payload).toBe('a');
      testBed.expectNotDispatched(feedApiError);
    });

    it('reports an error and stops on an unexpected failure', async () => {
      const services = defaultServices();
      services.feedFollowService.revokeFollowSecretAsync.mockResolvedValue(
        ApiResult.fromError(apiError(ApiErrorType.Unknown)),
      );
      const { testBed } = makeTestBed({ revokedFollowSecrets: ['a', 'b'] }, services);

      await testBed.dispatchHandled(revokeFollowSecrets({ fromUserAction: true }));

      expect(testBed.getDispatchedAction(feedApiError).payload.message).toBe('Failed to remove follower');
      testBed.expectNotDispatched(removeRevokableFollowSecret);
      expect(services.feedFollowService.revokeFollowSecretAsync).toHaveBeenCalledTimes(1);
    });
  });
});
