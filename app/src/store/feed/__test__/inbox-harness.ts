import { vi } from 'vitest';
import { combineReducers } from '@reduxjs/toolkit';
import { LocalDate } from '@js-joda/core';
import { createAddEffectTestBed } from '@/utils/__test__/add-effect-testbed';
import { createTestDb } from '@/utils/__test__/test-db';
import { addInboxEffects } from '@/store/feed/inbox-effects';
import { addFriendEffects } from '@/store/feed/friend-effects';
import feedReducer from '@/store/feed';
import { FeedIdentity, Friend, ReceivedReaction } from '@/models/feed-models';
import { RemoteData } from '@/models/remote';
import { ApiResult } from '@/services/api-error';
import { Session } from '@/models/session-models';
import { SessionBlueprint } from '@/models/blueprint-models';
import { DecryptedInboxMessage, FeedInboxDecryptionService } from '@/services/feed-inbox-decryption-service';
import { FeedApiService } from '@/services/feed-api';
import { FeedFollowService, InboxRecipient } from '@/services/feed-follow-service';
import {
  AesKeyJSON,
  Base64Uint8ArrayJSON,
  InboxMessageJSON,
  ReactionJSON,
  toJsonString,
} from '@/models/storage/versions/latest';
import { OutboxMessage } from '@/db/feed-outbox';
import { feedOutboxSchema } from '@/db/schema';
import { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';

export const OWN_SESSION_ID = 'session-1';
export const identity = new FeedIdentity(
  'me',
  'lookup',
  { value: new Uint8Array([5]) },
  {
    publicKey: { spkiPublicKeyBytes: new Uint8Array([6]) },
    privateKey: { pkcs8PrivateKeyBytes: new Uint8Array([7]) },
  },
  'pw',
  'Me',
  false,
  false,
  true,
);

function envelope(type: InboxMessageJSON['type'], senderUserId: string, payload: object): InboxMessageJSON {
  return {
    type,
    senderUserId,
    signature: '' as Base64Uint8ArrayJSON,
    payloadJson: toJsonString(payload),
  } as InboxMessageJSON;
}

export const inbox = {
  friendRequest: (sender: string, name = `name-${sender}`) => envelope('FriendRequest', sender, { name }),
  friendKeys: (sender: string, keys: string[] = ['a2V5'], followSecret = `their-secret-${sender}`) =>
    envelope('FriendKeys', sender, {
      aesKeys: keys.map((value) => ({ value }) as AesKeyJSON),
      followSecret,
    }),
  friendReject: (sender: string) => envelope('FriendReject', sender, {}),
  unfriend: (sender: string) => envelope('Unfriend', sender, {}),
  legacyFollowRequest: (sender: string) => envelope('FollowRequest', sender, { name: sender }),
  legacyUnfollow: (sender: string) => envelope('UnfollowNotification', sender, { followSecret: 'x' }),
  legacyFollowResponse: (sender: string) =>
    envelope('FollowResponse', sender, { response: { type: 'RejectedFollowResponse' } }),
  cheer: (sender: string, reaction: Partial<ReactionJSON> = {}) =>
    envelope('Reaction', sender, {
      reactionId: 'reaction-1',
      eventId: OWN_SESSION_ID,
      emoji: '💪',
      count: 1,
      reactedAt: '2026-07-13T10:00:00Z',
      ...reaction,
    }),
};

export type Delivery = {
  json: InboxMessageJSON;
  messageId?: string;
  sentAtMs?: number;
  kind?: 'ok' | 'invalid' | 'retry';
};

function outboxMessage(type: OutboxMessage['type'], recipient: InboxRecipient): OutboxMessage {
  return {
    messageId: `${type}-${recipient.id}-${Math.random()}`,
    recipientId: recipient.id,
    type,
    encryptedMessage: [],
  };
}

export async function makeInboxTestBed(options?: {
  friends?: Friend[];
  receivedReactions?: Record<string, ReceivedReaction>;
  sessions?: Session[];
}) {
  const services = {
    feedApiService: {
      getInboxMessagesAsync: vi
        .fn<FeedApiService['getInboxMessagesAsync']>()
        .mockResolvedValue(ApiResult.success({ inboxMessages: [] })),
      ackInboxMessagesAsync: vi.fn<FeedApiService['ackInboxMessagesAsync']>().mockResolvedValue(ApiResult.success()),
      getUserAsync: vi.fn((id: string) =>
        Promise.resolve(
          ApiResult.success({
            id,
            lookup: id,
            encryptedCurrentPlan: undefined,
            encryptedName: undefined,
            encryptionIV: new Uint8Array(),
            rsaPublicKey: new Uint8Array([1]),
          }),
        ),
      ),
    },
    feedInboxDecryptionService: {
      decrypt: vi.fn<FeedInboxDecryptionService['decrypt']>(),
    },
    feedFollowService: {
      issueFollowSecretAsync: vi.fn(() => Promise.resolve(ApiResult.success(`issued-${Math.random()}`))),
      friendRequestMessage: vi.fn((_: FeedIdentity, r: InboxRecipient) =>
        Promise.resolve(outboxMessage('FriendRequest', r)),
      ),
      friendKeysMessage: vi.fn((_: FeedIdentity, r: InboxRecipient, _secret: string) =>
        Promise.resolve(outboxMessage('FriendKeys', r)),
      ),
      friendRejectMessage: vi.fn((_: FeedIdentity, r: InboxRecipient) =>
        Promise.resolve(outboxMessage('FriendReject', r)),
      ),
      unfriendMessage: vi.fn((_: FeedIdentity, r: InboxRecipient) => Promise.resolve(outboxMessage('Unfriend', r))),
      legacyFollowRejectionMessage: vi.fn((_: FeedIdentity, r: InboxRecipient) =>
        Promise.resolve(outboxMessage('FollowResponse', r)),
      ),
      revokeFollowSecretAsync: vi
        .fn<FeedFollowService['revokeFollowSecretAsync']>()
        .mockResolvedValue(ApiResult.success()),
    },
  };
  const db = await createTestDb(
    options?.sessions ?? [
      new Session(
        OWN_SESSION_ID,
        new SessionBlueprint('Push', [], ''),
        [],
        LocalDate.of(2026, 7, 13),
        undefined,
        undefined,
      ),
    ],
  );

  const testBed = createAddEffectTestBed({
    initialState: {
      feed: {
        identity: RemoteData.success(identity),
        friends: Object.fromEntries((options?.friends ?? []).map((x) => [x.id, x])),
        receivedReactions: options?.receivedReactions ?? {},
      },
    },
    services: { ...services, db },
    reducer: combineReducers({ feed: feedReducer }),
  });

  addInboxEffects(testBed.addEffect);
  addFriendEffects(testBed.addEffect);
  return { testBed, services, db };
}

export type InboxTestBed = Awaited<ReturnType<typeof makeInboxTestBed>>;

let nextServerId = 0;

/** The decryption service is what classifies server messages; stub it to yield exactly these. */
export function deliver(services: InboxTestBed['services'], deliveries: (Delivery | InboxMessageJSON)[]) {
  const byServerId = new Map<string, DecryptedInboxMessage>();
  const inboxMessages = deliveries.map((x, index) => {
    const delivery = 'json' in x ? x : { json: x };
    const serverId = `server-${nextServerId++}`;
    const kind = delivery.kind ?? 'ok';
    byServerId.set(
      serverId,
      kind === 'ok'
        ? {
            kind,
            serverId,
            messageId: delivery.messageId ?? `message-${serverId}`,
            sentAtMs: delivery.sentAtMs ?? index + 1,
            json: delivery.json,
          }
        : { kind, serverId },
    );
    return { id: serverId, encryptedMessage: [] };
  });
  services.feedApiService.getInboxMessagesAsync.mockResolvedValue(ApiResult.success({ inboxMessages }));
  services.feedInboxDecryptionService.decrypt.mockImplementation((_, message) =>
    Promise.resolve(byServerId.get(message.id)!),
  );
  return inboxMessages.map((x) => x.id);
}

export function outboxRows(db: ExpoSQLiteDatabase) {
  return db
    .select()
    .from(feedOutboxSchema)
    .all()
    .map((x) => [x.recipientId, x.type]);
}
