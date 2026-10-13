import { describe, expect, it, vi } from 'vitest';
import { combineReducers } from '@reduxjs/toolkit';
import { Instant } from '@js-joda/core';
import { createAddEffectTestBed } from '@/utils/__test__/add-effect-testbed';
import { applyFeedEffects } from '@/store/feed/effects';
import feedReducer, { setIdentity, updateFeedIdentity } from '@/store/feed';
import { FeedIdentity } from '@/models/feed-models';
import { AesKey } from '@/models/encryption-models';
import { RemoteData } from '@/models/remote';
import { ApiErrorType, ApiResult } from '@/services/api-error';

const rsaKeyPair = {
  publicKey: { spkiPublicKeyBytes: new Uint8Array([2]) },
  privateKey: { pkcs8PrivateKeyBytes: new Uint8Array([3]) },
};

function makeIdentity() {
  return new FeedIdentity(
    'me',
    'lookup',
    { value: new Uint8Array([1]), algorithm: 'AES-GCM' },
    rsaKeyPair,
    'password',
    'Liam',
    false,
    false,
    false,
    [
      {
        key: { value: new Uint8Array([9]), algorithm: 'AES-GCM' },
        supersededAt: Instant.parse('2026-01-01T00:00:00Z'),
      },
    ],
  );
}

function makeTestBed(publishResult: ApiResult<void> = ApiResult.success()) {
  const feedIdentityService = {
    publishProfileAsync: vi
      .fn<(identity: FeedIdentity, currentPlan: unknown) => Promise<ApiResult<void>>>()
      .mockResolvedValue(publishResult),
  };
  const testBed = createAddEffectTestBed({
    initialState: {
      feed: { identity: RemoteData.success(makeIdentity()) },
      program: { isHydrated: false },
    },
    services: { feedIdentityService },
    reducer: combineReducers({ feed: feedReducer, program: (state: object = { isHydrated: false }) => state }),
  });
  applyFeedEffects(testBed.addEffect);
  const identity = () => testBed.getState().feed.identity.unwrapOr(undefined)!;
  return { testBed, feedIdentityService, identity };
}

describe('updateFeedIdentity', () => {
  it('publishes the updated profile and keeps every key', async () => {
    const { testBed, feedIdentityService, identity } = makeTestBed();

    await testBed.dispatchHandled(updateFeedIdentity({ updates: { name: 'Liam M' }, fromUserAction: true }));

    expect(feedIdentityService.publishProfileAsync.mock.calls[0]![0].name).toBe('Liam M');
    expect(identity().name).toBe('Liam M');
    expect(identity().previousAesKeys).toEqual(makeIdentity().previousAesKeys);
    expect(identity().aesKey).toEqual(makeIdentity().aesKey);
  });

  it('reverts only the edited fields when publishing fails', async () => {
    const { testBed, feedIdentityService, identity } = makeTestBed();
    const rotatedKey: AesKey = { value: new Uint8Array([7]), algorithm: 'AES-GCM' };
    feedIdentityService.publishProfileAsync.mockImplementation(() => {
      testBed.dispatch(setIdentity(RemoteData.success(identity().with({ aesKey: rotatedKey }))));
      return Promise.resolve(
        ApiResult.fromError({ type: ApiErrorType.Unknown, message: 'offline', exception: undefined }),
      );
    });

    await testBed.dispatchHandled(updateFeedIdentity({ updates: { publishPlan: true }, fromUserAction: true }));

    expect(identity().publishPlan).toBe(false);
    expect(identity().aesKey).toBe(rotatedKey);
  });

  it('keeps a rotated key when republishing it fails', async () => {
    const { testBed, identity } = makeTestBed(
      ApiResult.fromError({ type: ApiErrorType.Unknown, message: 'offline', exception: undefined }),
    );
    const rotated = identity().withRotatedAesKey({ value: new Uint8Array([7]), algorithm: 'AES-GCM' }, Instant.now());
    testBed.dispatch(setIdentity(RemoteData.success(rotated)));

    await testBed.dispatchHandled(updateFeedIdentity({ updates: {}, fromUserAction: false }));

    expect(identity().aesKey).toBe(rotated.aesKey);
    expect(identity().previousAesKeys).toBe(rotated.previousAesKeys);
  });

  it('does not touch an identity that was replaced while publishing', async () => {
    const { testBed, feedIdentityService, identity } = makeTestBed();
    const replacement = new FeedIdentity(
      'someone-else',
      'lookup-2',
      { value: new Uint8Array([4]), algorithm: 'AES-GCM' },
      rsaKeyPair,
      'pw',
      'New',
      true,
      true,
      true,
    );
    feedIdentityService.publishProfileAsync.mockImplementation(() => {
      testBed.dispatch(setIdentity(RemoteData.success(replacement)));
      return Promise.resolve(
        ApiResult.fromError({ type: ApiErrorType.Unknown, message: 'offline', exception: undefined }),
      );
    });

    await testBed.dispatchHandled(updateFeedIdentity({ updates: { publishPlan: false }, fromUserAction: true }));

    expect(identity()).toBe(replacement);
  });
});
