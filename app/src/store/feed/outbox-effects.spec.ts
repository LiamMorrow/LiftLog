import { describe, expect, it, vi } from 'vitest';
import { combineReducers } from '@reduxjs/toolkit';
import { createAddEffectTestBed } from '@/utils/__test__/add-effect-testbed';
import { createTestDb } from '@/utils/__test__/test-db';
import { addOutboxEffects, OUTBOX_GIVE_UP_AFTER_MS, outboxBackoffMs } from '@/store/feed/outbox-effects';
import feedReducer, { flushOutbox, setIdentity } from '@/store/feed';
import { FeedIdentity } from '@/models/feed-models';
import { RemoteData } from '@/models/remote';
import { ApiError, ApiErrorType, ApiResult } from '@/services/api-error';
import { enqueueOutboxMessages, OutboxMessage } from '@/db/feed-outbox';
import { feedOutboxSchema } from '@/db/schema';
import { PutInboxMessageRequest } from '@/models/feed-api-models';

const identity = { id: 'me', password: 'pw' } as FeedIdentity;

function message(recipientId: string, messageId: string): OutboxMessage {
  return { messageId, recipientId, type: 'Reaction', encryptedMessage: [new Uint8Array([1, 2, 3])] };
}

function failure(type: ApiErrorType): ApiResult<void> {
  return ApiResult.fromError({ type, message: 'failed', exception: undefined } satisfies ApiError);
}

async function makeTestBed() {
  const services = {
    feedApiService: {
      putInboxMessageAsync: vi.fn((_: PutInboxMessageRequest) => Promise.resolve(ApiResult.success())),
      getUserAsync: vi.fn().mockResolvedValue(ApiResult.success({})),
    },
  };
  const db = await createTestDb();
  const testBed = createAddEffectTestBed({
    initialState: { feed: { identity: RemoteData.success(identity) } },
    services: { ...services, db },
    reducer: combineReducers({ feed: feedReducer }),
  });
  addOutboxEffects(testBed.addEffect);
  const rows = () => db.select().from(feedOutboxSchema).all();
  return { testBed, services, db, rows };
}

describe('outbox-effects', () => {
  it('sends queued messages oldest first and removes them once delivered', async () => {
    const { testBed, db, services, rows } = await makeTestBed();
    enqueueOutboxMessages(db, [message('alice', 'm1'), message('bob', 'm2'), message('alice', 'm3')]);

    await testBed.dispatchHandled(flushOutbox());

    expect(services.feedApiService.putInboxMessageAsync.mock.calls.map((x) => x[0].toUserId)).toEqual([
      'alice',
      'bob',
      'alice',
    ]);
    expect(services.feedApiService.putInboxMessageAsync.mock.calls[0]![0].encryptedMessage).toEqual([
      new Uint8Array([1, 2, 3]),
    ]);
    expect(rows()).toEqual([]);
  });

  it('holds back the rest of a recipient’s messages after a failure, without blocking anyone else', async () => {
    const { testBed, db, services, rows } = await makeTestBed();
    enqueueOutboxMessages(db, [message('alice', 'm1'), message('alice', 'm2'), message('bob', 'm3')]);
    services.feedApiService.putInboxMessageAsync.mockImplementationOnce(() =>
      Promise.resolve(failure(ApiErrorType.Unknown)),
    );
    const before = Date.now();

    await testBed.dispatchHandled(flushOutbox());

    expect(services.feedApiService.putInboxMessageAsync.mock.calls.map((x) => x[0].toUserId)).toEqual(['alice', 'bob']);
    const remaining = rows();
    expect(remaining.map((x) => x.messageId)).toEqual(['m1', 'm2']);
    expect(remaining[0]!.attempts).toBe(1);
    expect(remaining[0]!.nextAttemptAtMs).toBeGreaterThanOrEqual(before + outboxBackoffMs(1));
  });

  it('waits out the backoff before trying a recipient again', async () => {
    const { testBed, db, services } = await makeTestBed();
    enqueueOutboxMessages(db, [message('alice', 'm1')]);
    db.update(feedOutboxSchema)
      .set({ nextAttemptAtMs: Date.now() + 60_000 })
      .run();

    await testBed.dispatchHandled(flushOutbox());

    expect(services.feedApiService.putInboxMessageAsync).not.toHaveBeenCalled();
  });

  it('drops a message the server rejects as malformed', async () => {
    const { testBed, db, services, rows } = await makeTestBed();
    enqueueOutboxMessages(db, [message('alice', 'm1'), message('alice', 'm2')]);
    services.feedApiService.putInboxMessageAsync.mockImplementationOnce(() =>
      Promise.resolve(failure(ApiErrorType.BadRequest)),
    );

    await testBed.dispatchHandled(flushOutbox());

    expect(services.feedApiService.putInboxMessageAsync).toHaveBeenCalledTimes(2);
    expect(rows()).toEqual([]);
  });

  it('drops every message to a recipient who no longer exists', async () => {
    const { testBed, db, services, rows } = await makeTestBed();
    enqueueOutboxMessages(db, [message('gone', 'm1'), message('gone', 'm2'), message('bob', 'm3')]);
    services.feedApiService.putInboxMessageAsync.mockImplementationOnce(() =>
      Promise.resolve(failure(ApiErrorType.NotFound)),
    );
    services.feedApiService.getUserAsync.mockImplementation((id: string) =>
      Promise.resolve(id === 'gone' ? failure(ApiErrorType.NotFound) : ApiResult.success({})),
    );

    await testBed.dispatchHandled(flushOutbox());

    expect(services.feedApiService.putInboxMessageAsync.mock.calls.map((x) => x[0].toUserId)).toEqual(['gone', 'bob']);
    expect(rows()).toEqual([]);
  });

  it('keeps a message when a 404 might mean the server itself is misconfigured', async () => {
    const { testBed, db, services, rows } = await makeTestBed();
    enqueueOutboxMessages(db, [message('alice', 'm1')]);
    services.feedApiService.putInboxMessageAsync.mockImplementationOnce(() =>
      Promise.resolve(failure(ApiErrorType.NotFound)),
    );
    services.feedApiService.getUserAsync.mockResolvedValue(failure(ApiErrorType.NotFound));

    await testBed.dispatchHandled(flushOutbox());

    expect(rows().map((x) => x.attempts)).toEqual([1]);
  });

  it('gives up on a message that is still failing after the give-up window', async () => {
    const { testBed, db, services, rows } = await makeTestBed();
    enqueueOutboxMessages(db, [message('alice', 'm1')], Date.now() - OUTBOX_GIVE_UP_AFTER_MS - 1000);
    services.feedApiService.putInboxMessageAsync.mockImplementationOnce(() =>
      Promise.resolve(failure(ApiErrorType.Unknown)),
    );

    await testBed.dispatchHandled(flushOutbox());

    expect(rows()).toEqual([]);
  });

  it('still delivers an old message if the server accepts it', async () => {
    const { testBed, db, services, rows } = await makeTestBed();
    enqueueOutboxMessages(db, [message('alice', 'm1')], Date.now() - OUTBOX_GIVE_UP_AFTER_MS - 1000);

    await testBed.dispatchHandled(flushOutbox());

    expect(services.feedApiService.putInboxMessageAsync).toHaveBeenCalledTimes(1);
    expect(rows()).toEqual([]);
  });

  it('stops when the identity changes part way through', async () => {
    const { testBed, db, services } = await makeTestBed();
    enqueueOutboxMessages(db, [message('alice', 'm1'), message('bob', 'm2')]);
    services.feedApiService.putInboxMessageAsync.mockImplementationOnce(() => {
      testBed.dispatch(setIdentity(RemoteData.success({ id: 'new-account', password: 'pw' } as FeedIdentity)));
      return Promise.resolve(ApiResult.success());
    });

    await testBed.dispatchHandled(flushOutbox());

    expect(services.feedApiService.putInboxMessageAsync).toHaveBeenCalledTimes(1);
  });

  it('runs one flush at a time, and flushes again if asked while busy', async () => {
    const { testBed, db, services, rows } = await makeTestBed();
    enqueueOutboxMessages(db, [message('alice', 'm1')]);
    let release!: () => void;
    services.feedApiService.putInboxMessageAsync.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          release = () => resolve(ApiResult.success());
        }),
    );

    const first = testBed.dispatchHandled(flushOutbox());
    enqueueOutboxMessages(db, [message('bob', 'm2')]);
    await testBed.dispatchHandled(flushOutbox());
    expect(services.feedApiService.putInboxMessageAsync).toHaveBeenCalledTimes(1);

    release();
    await first;

    expect(services.feedApiService.putInboxMessageAsync).toHaveBeenCalledTimes(2);
    expect(rows()).toEqual([]);
  });
});
