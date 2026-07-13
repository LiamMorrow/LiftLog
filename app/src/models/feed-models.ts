import { Session } from '@/models/session-models/session';
import { match } from 'ts-pattern';
import {
  PendingFeedUserJSON,
  FollowedFeedUserJSON,
  FeedUserJSON,
  SessionUserEventJSON,
  FeedIdentityJSON,
  InboxMessageJSON,
  FollowRequestJSON,
  SharedItemJSON,
  SharedProgramBlueprintJSON,
  SharedSessionJSON,
  RsaKeyPair,
  AesKey,
  fromAesKeyJSON,
  fromRsaKeyPairJSON,
  toAesKeyJSON,
  toRsaKeyPairJSON,
  RsaPublicKey,
  fromRsaPublicKeyJSON,
  toRsaPublicKeyJSON,
  fromJsonString,
  FollowRequestInboxMessageJSON,
  toBase64Uint8ArrayJSON,
  fromBase64Uint8ArrayJSON,
  toJsonString,
  fromInstantJson,
  toInstantJson,
  FollowerFeedUserJSON,
  UserEventJSON,
  RemovedSessionUserEventJSON,
  AcceptedFollowResponseJSON,
  RejectedFollowResponseJSON,
  FollowResponseJSON,
  UnfollowNotificationJSON,
  FollowResponseInboxMessageJSON,
  UnfollowNotificationInboxMessageJSON,
  ReactionJSON,
  ReactionInboxMessageJSON,
  ReceivedReactionJSON,
  SentReactionJSON,
} from '@/models/storage/versions/latest';
import { ProgramBlueprint } from '@/models/blueprint-models';
import { Instant } from '@js-joda/core';
import { equal } from '@/models/session-models/helpers';

/**
 * How long a published feed event lives on the server before it expires. Followed users' sessions are
 * therefore only knowable for this window — beyond it their absence means "expired", not "didn't train".
 */
export const FEED_EVENT_RETENTION_DAYS = 90;
export const FEED_EVENT_RETENTION_SECONDS = FEED_EVENT_RETENTION_DAYS * 24 * 60 * 60;

// ---------------------------------------------------------------------------
// FeedUser
// ---------------------------------------------------------------------------

export class FollowerFeedUser {
  readonly type = 'PendingFeedUser' as const;

  constructor(
    readonly id: string,
    readonly publicKey: RsaPublicKey,
    readonly name: string | undefined,
    readonly followSecret: string,
  ) {}

  static fromJSON(json: FollowerFeedUserJSON): FollowerFeedUser {
    return new FollowerFeedUser(json.id, fromRsaPublicKeyJSON(json.publicKey), json.name, json.followSecret);
  }

  toJSON(): FollowerFeedUserJSON {
    return {
      type: 'FollowerFeedUser',
      id: this.id,
      publicKey: toRsaPublicKeyJSON(this.publicKey),
      name: this.name,
      followSecret: this.followSecret,
    };
  }

  equals(other: FollowerFeedUser | undefined): boolean {
    if (!other) return false;
    if (other === this) return true;
    if (other.type !== this.type) return false;
    return this.id === other.id && this.name === other.name && this.followSecret === other.followSecret;
  }

  with(other: Partial<FollowerFeedUser>): FollowerFeedUser {
    return new FollowerFeedUser(
      other.id ?? this.id,
      other.publicKey ?? this.publicKey,
      'name' in other ? other.name : this.name,
      other.followSecret ?? this.followSecret,
    );
  }
}
export class PendingFeedUser {
  readonly type = 'PendingFeedUser' as const;

  constructor(
    readonly id: string,
    readonly publicKey: RsaPublicKey,
    readonly name: string | undefined,
  ) {}

  static fromJSON(json: PendingFeedUserJSON): PendingFeedUser {
    return new PendingFeedUser(json.id, fromRsaPublicKeyJSON(json.publicKey), json.name);
  }

  toJSON(): PendingFeedUserJSON {
    return {
      type: 'PendingFeedUser',
      id: this.id,
      publicKey: toRsaPublicKeyJSON(this.publicKey),
      name: this.name,
    };
  }

  equals(other: FeedUser | undefined): boolean {
    if (!other) return false;
    if (other === this) return true;
    if (other.type !== this.type) return false;
    return this.id === other.id && this.name === other.name;
  }

  with(other: Partial<PendingFeedUser>): PendingFeedUser {
    return new PendingFeedUser(
      other.id ?? this.id,
      other.publicKey ?? this.publicKey,
      'name' in other ? other.name : this.name,
    );
  }
}

export class FollowedFeedUser {
  readonly type = 'FollowedFeedUser' as const;

  constructor(
    readonly id: string,
    readonly publicKey: RsaPublicKey,
    readonly name: string | undefined,
    readonly currentPlan: ProgramBlueprint | undefined,
    readonly aesKey: AesKey,
    readonly followSecret: string,
  ) {}

  static fromJSON(json: FollowedFeedUserJSON): FollowedFeedUser {
    return new FollowedFeedUser(
      json.id,
      fromRsaPublicKeyJSON(json.publicKey),
      json.name,
      json.currentPlan && ProgramBlueprint.fromJSON(json.currentPlan),
      fromAesKeyJSON(json.aesKey),
      json.followSecret,
    );
  }

  toJSON(): FollowedFeedUserJSON {
    return {
      version: 2,
      type: 'FollowedFeedUser',
      id: this.id,
      publicKey: toRsaPublicKeyJSON(this.publicKey),
      name: this.name,
      currentPlan: this.currentPlan?.toJSON(),
      aesKey: toAesKeyJSON(this.aesKey),
      followSecret: this.followSecret,
    };
  }

  equals(other: FeedUser | undefined): boolean {
    if (!other) return false;
    if (other === this) return true;
    if (other.type !== this.type) return false;
    return (
      this.id === other.id &&
      this.name === other.name &&
      this.followSecret === other.followSecret &&
      equal(this.currentPlan, other.currentPlan)
    );
  }

  with(other: Partial<FollowedFeedUser>): FollowedFeedUser {
    return new FollowedFeedUser(
      other.id ?? this.id,
      other.publicKey ?? this.publicKey,
      'name' in other ? other.name : this.name,
      other.currentPlan ?? this.currentPlan,
      other.aesKey ?? this.aesKey,
      other.followSecret ?? this.followSecret,
    );
  }
}

export type FeedUser = PendingFeedUser | FollowedFeedUser | FollowerFeedUser;

export function fromFeedUserJSON(json: FeedUserJSON): FeedUser {
  return match(json)
    .with({ type: 'PendingFeedUser' }, PendingFeedUser.fromJSON)
    .with({ type: 'FollowedFeedUser' }, FollowedFeedUser.fromJSON)
    .with({ type: 'FollowerFeedUser' }, FollowerFeedUser.fromJSON)
    .exhaustive();
}

// ---------------------------------------------------------------------------
// UserEvent
// ---------------------------------------------------------------------------

export class SessionUserEvent {
  readonly type = 'SessionUserEvent' as const;

  constructor(
    readonly userId: string,
    readonly eventId: string,
    readonly timestamp: Instant,
    readonly expiry: Instant,
    readonly session: Session,
  ) {}

  get id() {
    return this.userId + this.eventId;
  }

  static fromJSON(json: SessionUserEventJSON): SessionUserEvent {
    return new SessionUserEvent(
      json.userId,
      json.eventId,
      fromInstantJson(json.timestamp),
      fromInstantJson(json.expiry),
      Session.fromJSON(json.session),
    );
  }

  toJSON(): SessionUserEventJSON {
    return {
      version: 2,
      type: 'SessionUserEvent',
      userId: this.userId,
      eventId: this.eventId,
      timestamp: toInstantJson(this.timestamp),
      expiry: toInstantJson(this.expiry),
      session: this.session.toJSON(),
    };
  }

  equals(other: FeedUserEvent | undefined): boolean {
    if (!other) return false;
    if (other === this) return true;
    if (other.type !== this.type) return false;
    return this.userId === other.userId && this.eventId === other.eventId && this.session.equals(other.session);
  }

  with(other: Partial<SessionUserEvent>): SessionUserEvent {
    return new SessionUserEvent(
      other.userId ?? this.userId,
      other.eventId ?? this.eventId,
      other.timestamp ?? this.timestamp,
      other.expiry ?? this.expiry,
      other.session ?? this.session,
    );
  }
}

export class RemovedSessionUserEvent {
  readonly type = 'RemovedSessionUserEvent' as const;

  constructor(
    readonly userId: string,
    readonly eventId: string,
    readonly timestamp: Instant,
    readonly expiry: Instant,
    readonly sessionId: string,
  ) {}

  get id() {
    return this.userId + this.eventId;
  }

  static fromJSON(json: RemovedSessionUserEventJSON): RemovedSessionUserEvent {
    return new RemovedSessionUserEvent(
      json.userId,
      json.eventId,
      fromInstantJson(json.timestamp),
      fromInstantJson(json.expiry),
      json.sessionId,
    );
  }

  toJSON(): RemovedSessionUserEventJSON {
    return {
      type: 'RemovedSessionUserEvent',
      userId: this.userId,
      eventId: this.eventId,
      timestamp: toInstantJson(this.timestamp),
      expiry: toInstantJson(this.expiry),
      sessionId: this.sessionId,
    };
  }

  equals(other: FeedUserEvent | undefined): boolean {
    if (!other) return false;
    if (other === this) return true;
    if (other.type !== this.type) return false;
    return this.userId === other.userId && this.eventId === other.eventId && this.sessionId === other.sessionId;
  }

  with(other: Partial<RemovedSessionUserEvent>): RemovedSessionUserEvent {
    return new RemovedSessionUserEvent(
      other.userId ?? this.userId,
      other.eventId ?? this.eventId,
      other.timestamp ?? this.timestamp,
      other.expiry ?? this.expiry,
      other.sessionId ?? this.sessionId,
    );
  }
}

export type FeedUserEvent = SessionUserEvent | RemovedSessionUserEvent;

export function fromFeedUserEventJSON(json: UserEventJSON): FeedUserEvent {
  return match(json)
    .with({ type: 'SessionUserEvent' }, SessionUserEvent.fromJSON)
    .with({ type: 'RemovedSessionUserEvent' }, RemovedSessionUserEvent.fromJSON)
    .exhaustive();
}

// ---------------------------------------------------------------------------
// FeedIdentity
// ---------------------------------------------------------------------------

export class FeedIdentity {
  constructor(
    readonly id: string,
    readonly lookup: string,
    readonly aesKey: AesKey,
    readonly rsaKeyPair: RsaKeyPair,
    readonly password: string,
    readonly name: string | undefined,
    readonly publishBodyweight: boolean,
    readonly publishPlan: boolean,
    readonly publishWorkouts: boolean,
  ) {}

  static fromJSON(json: FeedIdentityJSON): FeedIdentity {
    return new FeedIdentity(
      json.id,
      json.lookup,
      fromAesKeyJSON(json.aesKey),
      fromRsaKeyPairJSON(json.rsaKeyPair),
      json.password,
      json.name,
      json.publishBodyweight,
      json.publishPlan,
      json.publishWorkouts,
    );
  }

  toJSON(): FeedIdentityJSON {
    return {
      id: this.id,
      lookup: this.lookup,
      aesKey: toAesKeyJSON(this.aesKey),
      rsaKeyPair: toRsaKeyPairJSON(this.rsaKeyPair),
      password: this.password,
      name: this.name,
      publishBodyweight: this.publishBodyweight,
      publishPlan: this.publishPlan,
      publishWorkouts: this.publishWorkouts,
    };
  }

  equals(other: FeedIdentity | undefined): boolean {
    if (!other) return false;
    if (other === this) return true;
    return (
      this.id === other.id &&
      this.lookup === other.lookup &&
      this.password === other.password &&
      this.name === other.name &&
      this.publishBodyweight === other.publishBodyweight &&
      this.publishPlan === other.publishPlan &&
      this.publishWorkouts === other.publishWorkouts
    );
  }

  with(other: Partial<FeedIdentity>): FeedIdentity {
    return new FeedIdentity(
      other.id ?? this.id,
      other.lookup ?? this.lookup,
      other.aesKey ?? this.aesKey,
      other.rsaKeyPair ?? this.rsaKeyPair,
      other.password ?? this.password,
      'name' in other ? other.name : this.name,
      other.publishBodyweight ?? this.publishBodyweight,
      other.publishPlan ?? this.publishPlan,
      other.publishWorkouts ?? this.publishWorkouts,
    );
  }
}

// ---------------------------------------------------------------------------
// SharedItem
// ---------------------------------------------------------------------------

export class SharedProgramBlueprint {
  readonly type = 'SharedProgramBlueprint' as const;

  constructor(readonly programBlueprint: ProgramBlueprint) {}

  static fromJSON(json: SharedProgramBlueprintJSON): SharedProgramBlueprint {
    return new SharedProgramBlueprint(ProgramBlueprint.fromJSON(json.programBlueprint));
  }

  toJSON(): SharedProgramBlueprintJSON {
    return {
      version: 2,
      type: 'SharedProgramBlueprint',
      programBlueprint: this.programBlueprint.toJSON(),
    };
  }

  equals(other: SharedItem | undefined): boolean {
    if (!other) return false;
    if (other === this) return true;
    if (other.type !== this.type) return false;
    return this.programBlueprint.equals(other.programBlueprint);
  }

  with(other: Partial<SharedProgramBlueprint>): SharedProgramBlueprint {
    return new SharedProgramBlueprint(other.programBlueprint ?? this.programBlueprint);
  }
}

export class SharedSession {
  readonly type = 'SharedSession' as const;

  constructor(readonly session: Session) {}

  static fromJSON(json: SharedSessionJSON): SharedSession {
    return new SharedSession(Session.fromJSON(json.session));
  }

  toJSON(): SharedSessionJSON {
    return {
      version: 2,
      type: 'SharedSession',
      session: this.session.toJSON(),
    };
  }

  equals(other: SharedItem | undefined): boolean {
    if (!other) return false;
    if (other === this) return true;
    if (other.type !== this.type) return false;
    return this.session.equals(other.session);
  }

  with(other: Partial<SharedSession>): SharedSession {
    return new SharedSession(other.session ?? this.session);
  }
}

export type SharedItem = SharedProgramBlueprint | SharedSession;

export function fromSharedItemJSON(json: SharedItemJSON): SharedItem {
  return match(json)
    .with({ type: 'SharedProgramBlueprint' }, SharedProgramBlueprint.fromJSON)
    .with({ type: 'SharedSession' }, SharedSession.fromJSON)
    .exhaustive();
}
// ---------------------------------------------------------------------------
// InboxMessage payloads
// ---------------------------------------------------------------------------

export class FollowRequest {
  readonly type = 'FollowRequest' as const;

  constructor(readonly name: string | undefined) {}

  static fromJSON(json: FollowRequestJSON): FollowRequest {
    return new FollowRequest(json.name);
  }

  toJSON(): FollowRequestJSON {
    return { name: this.name };
  }

  equals(other: InboxMessagePayload | undefined): boolean {
    if (!other) return false;
    if (other === this) return true;
    if (other.type !== this.type) return false;
    return this.name === other.name;
  }

  with(other: Partial<FollowRequest>): FollowRequest {
    return new FollowRequest('name' in other ? other.name : this.name);
  }
}

export class AcceptedFollowResponse {
  readonly type = 'AcceptedFollowResponse' as const;

  constructor(
    readonly aesKey: AesKey,
    readonly followSecret: string,
  ) {}

  static fromJSON(json: AcceptedFollowResponseJSON): AcceptedFollowResponse {
    return new AcceptedFollowResponse(fromAesKeyJSON(json.aesKey), json.followSecret);
  }

  toJSON(): AcceptedFollowResponseJSON {
    return {
      type: 'AcceptedFollowResponse',
      aesKey: toAesKeyJSON(this.aesKey),
      followSecret: this.followSecret,
    };
  }

  equals(other: FollowResponsePayload | undefined): boolean {
    if (!other) return false;
    if (other === this) return true;
    if (other.type !== this.type) return false;
    return this.followSecret === other.followSecret;
  }

  with(other: Partial<AcceptedFollowResponse>): AcceptedFollowResponse {
    return new AcceptedFollowResponse(other.aesKey ?? this.aesKey, other.followSecret ?? this.followSecret);
  }
}

export class RejectedFollowResponse {
  readonly type = 'RejectedFollowResponse' as const;

  static fromJSON(_json: RejectedFollowResponseJSON): RejectedFollowResponse {
    return new RejectedFollowResponse();
  }

  toJSON(): RejectedFollowResponseJSON {
    return { type: 'RejectedFollowResponse' };
  }

  equals(other: FollowResponsePayload | undefined): boolean {
    if (!other) return false;
    return other.type === this.type;
  }

  with(_other: Partial<RejectedFollowResponse>): RejectedFollowResponse {
    return this;
  }
}

export type FollowResponsePayload = AcceptedFollowResponse | RejectedFollowResponse;

function fromFollowResponsePayloadJSON(
  json: AcceptedFollowResponseJSON | RejectedFollowResponseJSON,
): FollowResponsePayload {
  return match(json)
    .with({ type: 'AcceptedFollowResponse' }, AcceptedFollowResponse.fromJSON)
    .with({ type: 'RejectedFollowResponse' }, RejectedFollowResponse.fromJSON)
    .exhaustive();
}

export class FollowResponse {
  readonly type = 'FollowResponse' as const;

  constructor(readonly response: FollowResponsePayload) {}

  static fromJSON(json: FollowResponseJSON): FollowResponse {
    return new FollowResponse(fromFollowResponsePayloadJSON(json.response));
  }

  toJSON(): FollowResponseJSON {
    return { response: this.response.toJSON() };
  }

  equals(other: InboxMessagePayload | undefined): boolean {
    if (!other) return false;
    if (other === this) return true;
    if (other.type !== this.type) return false;
    return this.response.equals(other.response);
  }

  with(other: Partial<FollowResponse>): FollowResponse {
    return new FollowResponse(other.response ?? this.response);
  }
}

export class UnfollowNotification {
  readonly type = 'UnfollowNotification' as const;

  constructor(readonly followSecret: string) {}

  static fromJSON(json: UnfollowNotificationJSON): UnfollowNotification {
    return new UnfollowNotification(json.followSecret);
  }

  toJSON(): UnfollowNotificationJSON {
    return { followSecret: this.followSecret };
  }

  equals(other: InboxMessagePayload | undefined): boolean {
    if (!other) return false;
    if (other === this) return true;
    if (other.type !== this.type) return false;
    return this.followSecret === other.followSecret;
  }

  with(other: Partial<UnfollowNotification>): UnfollowNotification {
    return new UnfollowNotification(other.followSecret ?? this.followSecret);
  }
}

/**
 * A fixed allowlist. The emoji arrives from another user over an unauthenticated inbox, so it is
 * attacker-controlled: it must be validated on receipt, not merely constrained on send.
 */
export const REACTION_EMOJIS = ['💪', '🔥', '👏', '🎉', '🫡'] as const;
export type ReactionEmoji = (typeof REACTION_EMOJIS)[number];

/** Cheers accumulate, so a single message can carry several taps of the same emoji. */
export const MAX_REACTION_COUNT = 50;
/** Bounds how much a hostile follower can grow your database. */
export const MAX_REACTIONS_PER_SENDER_PER_EVENT = 20;

export function isReactionEmoji(value: string): value is ReactionEmoji {
  return (REACTION_EMOJIS as readonly string[]).includes(value);
}

export function isValidReactionCount(value: number): boolean {
  return Number.isInteger(value) && value >= 1 && value <= MAX_REACTION_COUNT;
}

export class Reaction {
  readonly type = 'Reaction' as const;

  constructor(
    readonly reactionId: string,
    readonly eventId: string,
    readonly emoji: ReactionEmoji,
    readonly count: number,
    readonly reactedAt: Instant,
  ) {}

  // Both fields arrive from another user over an unauthenticated inbox. Rejecting here means a hostile
  // payload is dropped at the parse boundary, before it can reach the database or the screen.
  static fromJSON(json: ReactionJSON): Reaction {
    if (!isReactionEmoji(json.emoji)) {
      throw new Error('Unrecognised reaction emoji');
    }
    if (!isValidReactionCount(json.count)) {
      throw new Error('Reaction count out of range');
    }
    return new Reaction(json.reactionId, json.eventId, json.emoji, json.count, fromInstantJson(json.reactedAt));
  }

  toJSON(): ReactionJSON {
    return {
      reactionId: this.reactionId,
      eventId: this.eventId,
      emoji: this.emoji,
      count: this.count,
      reactedAt: toInstantJson(this.reactedAt),
    };
  }

  equals(other: InboxMessagePayload | undefined): boolean {
    if (!other) return false;
    if (other === this) return true;
    if (other.type !== this.type) return false;
    return (
      this.reactionId === other.reactionId &&
      this.eventId === other.eventId &&
      this.emoji === other.emoji &&
      this.count === other.count &&
      this.reactedAt.equals(other.reactedAt)
    );
  }

  with(other: Partial<Reaction>): Reaction {
    return new Reaction(
      other.reactionId ?? this.reactionId,
      other.eventId ?? this.eventId,
      other.emoji ?? this.emoji,
      other.count ?? this.count,
      other.reactedAt ?? this.reactedAt,
    );
  }
}

export type InboxMessagePayload = FollowRequest | FollowResponse | UnfollowNotification | Reaction;

// ---------------------------------------------------------------------------
// InboxMessage
// ---------------------------------------------------------------------------

export class FollowRequestInboxMessage {
  readonly type = 'FollowRequest' as const;

  constructor(
    readonly senderUserId: string,
    readonly signature: Uint8Array,
    readonly payload: FollowRequest,
  ) {}

  static fromJSON(json: FollowRequestInboxMessageJSON): FollowRequestInboxMessage {
    return new FollowRequestInboxMessage(
      json.senderUserId,
      fromBase64Uint8ArrayJSON(json.signature),
      FollowRequest.fromJSON(fromJsonString(json.payloadJson)),
    );
  }

  toJSON(): FollowRequestInboxMessageJSON {
    return {
      type: 'FollowRequest',
      senderUserId: this.senderUserId,
      signature: toBase64Uint8ArrayJSON(this.signature),
      payloadJson: toJsonString(this.payload.toJSON()),
    };
  }

  equals(other: InboxMessage | undefined): boolean {
    if (!other) return false;
    if (other === this) return true;
    if (other.type !== this.type) return false;
    return this.senderUserId === other.senderUserId && this.payload.equals(other.payload);
  }

  with(other: Partial<FollowRequestInboxMessage>): FollowRequestInboxMessage {
    return new FollowRequestInboxMessage(
      other.senderUserId ?? this.senderUserId,
      other.signature ?? this.signature,
      other.payload ?? this.payload,
    );
  }
}

export class FollowResponseInboxMessage {
  readonly type = 'FollowResponse' as const;

  constructor(
    readonly senderUserId: string,
    readonly signature: Uint8Array,
    readonly payload: FollowResponse,
  ) {}

  static fromJSON(json: FollowResponseInboxMessageJSON): FollowResponseInboxMessage {
    return new FollowResponseInboxMessage(
      json.senderUserId,
      fromBase64Uint8ArrayJSON(json.signature),
      FollowResponse.fromJSON(fromJsonString(json.payloadJson)),
    );
  }

  toJSON(): FollowResponseInboxMessageJSON {
    return {
      type: 'FollowResponse',
      senderUserId: this.senderUserId,
      signature: toBase64Uint8ArrayJSON(this.signature),
      payloadJson: toJsonString(this.payload.toJSON()),
    };
  }

  equals(other: InboxMessage | undefined): boolean {
    if (!other) return false;
    if (other === this) return true;
    if (other.type !== this.type) return false;
    return this.senderUserId === other.senderUserId && this.payload.equals(other.payload);
  }

  with(other: Partial<FollowResponseInboxMessage>): FollowResponseInboxMessage {
    return new FollowResponseInboxMessage(
      other.senderUserId ?? this.senderUserId,
      other.signature ?? this.signature,
      other.payload ?? this.payload,
    );
  }
}

export class UnfollowNotificationInboxMessage {
  readonly type = 'UnfollowNotification' as const;

  constructor(
    readonly senderUserId: string,
    readonly signature: Uint8Array,
    readonly payload: UnfollowNotification,
  ) {}

  static fromJSON(json: UnfollowNotificationInboxMessageJSON): UnfollowNotificationInboxMessage {
    return new UnfollowNotificationInboxMessage(
      json.senderUserId,
      fromBase64Uint8ArrayJSON(json.signature),
      UnfollowNotification.fromJSON(fromJsonString(json.payloadJson)),
    );
  }

  toJSON(): UnfollowNotificationInboxMessageJSON {
    return {
      type: 'UnfollowNotification',
      senderUserId: this.senderUserId,
      signature: toBase64Uint8ArrayJSON(this.signature),
      payloadJson: toJsonString(this.payload.toJSON()),
    };
  }

  equals(other: InboxMessage | undefined): boolean {
    if (!other) return false;
    if (other === this) return true;
    if (other.type !== this.type) return false;
    return this.senderUserId === other.senderUserId && this.payload.equals(other.payload);
  }

  with(other: Partial<UnfollowNotificationInboxMessage>): UnfollowNotificationInboxMessage {
    return new UnfollowNotificationInboxMessage(
      other.senderUserId ?? this.senderUserId,
      other.signature ?? this.signature,
      other.payload ?? this.payload,
    );
  }
}

export class ReactionInboxMessage {
  readonly type = 'Reaction' as const;

  constructor(
    readonly senderUserId: string,
    readonly signature: Uint8Array,
    readonly payload: Reaction,
  ) {}

  static fromJSON(json: ReactionInboxMessageJSON): ReactionInboxMessage {
    return new ReactionInboxMessage(
      json.senderUserId,
      fromBase64Uint8ArrayJSON(json.signature),
      Reaction.fromJSON(fromJsonString(json.payloadJson)),
    );
  }

  toJSON(): ReactionInboxMessageJSON {
    return {
      type: 'Reaction',
      senderUserId: this.senderUserId,
      signature: toBase64Uint8ArrayJSON(this.signature),
      payloadJson: toJsonString(this.payload.toJSON()),
    };
  }

  equals(other: InboxMessage | undefined): boolean {
    if (!other) return false;
    if (other === this) return true;
    if (other.type !== this.type) return false;
    return this.senderUserId === other.senderUserId && this.payload.equals(other.payload);
  }

  with(other: Partial<ReactionInboxMessage>): ReactionInboxMessage {
    return new ReactionInboxMessage(
      other.senderUserId ?? this.senderUserId,
      other.signature ?? this.signature,
      other.payload ?? this.payload,
    );
  }
}

export type InboxMessage =
  | FollowRequestInboxMessage
  | FollowResponseInboxMessage
  | UnfollowNotificationInboxMessage
  | ReactionInboxMessage;

export function fromInboxMessageJSON(json: InboxMessageJSON): InboxMessage {
  return match(json)
    .with({ type: 'FollowRequest' }, FollowRequestInboxMessage.fromJSON)
    .with({ type: 'FollowResponse' }, FollowResponseInboxMessage.fromJSON)
    .with({ type: 'UnfollowNotification' }, UnfollowNotificationInboxMessage.fromJSON)
    .with({ type: 'Reaction' }, ReactionInboxMessage.fromJSON)
    .exhaustive();
}

/** A cheer someone sent you. Author-only: nobody else can see who cheered your workout. */
export class ReceivedReaction {
  constructor(
    readonly id: string,
    readonly eventId: string,
    readonly fromUserId: string,
    readonly emoji: ReactionEmoji,
    readonly count: number,
    readonly reactedAt: Instant,
  ) {}

  static fromJSON(json: ReceivedReactionJSON): ReceivedReaction {
    if (!isReactionEmoji(json.emoji)) {
      throw new Error('Unrecognised reaction emoji');
    }
    return new ReceivedReaction(
      json.id,
      json.eventId,
      json.fromUserId,
      json.emoji,
      json.count,
      fromInstantJson(json.reactedAt),
    );
  }

  toJSON(): ReceivedReactionJSON {
    return {
      id: this.id,
      eventId: this.eventId,
      fromUserId: this.fromUserId,
      emoji: this.emoji,
      count: this.count,
      reactedAt: toInstantJson(this.reactedAt),
    };
  }
}

/** A cheer you sent. The server deletes inbox messages on read, so this is the only record you'll ever have. */
export class SentReaction {
  constructor(
    readonly id: string,
    readonly eventId: string,
    readonly emoji: ReactionEmoji,
    readonly count: number,
    readonly reactedAt: Instant,
  ) {}

  static fromJSON(json: SentReactionJSON): SentReaction {
    if (!isReactionEmoji(json.emoji)) {
      throw new Error('Unrecognised reaction emoji');
    }
    return new SentReaction(json.id, json.eventId, json.emoji, json.count, fromInstantJson(json.reactedAt));
  }

  toJSON(): SentReactionJSON {
    return {
      id: this.id,
      eventId: this.eventId,
      emoji: this.emoji,
      count: this.count,
      reactedAt: toInstantJson(this.reactedAt),
    };
  }
}
