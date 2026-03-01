import { Instant } from '@js-joda/core';
import {
  ProgramBlueprint,
  ProgramBlueprintPOJO,
  SessionBlueprint,
  SessionBlueprintPOJO,
} from './blueprint-models';
import { RsaPublicKey, AesKey, RsaKeyPair } from '@/models/encryption-models';
import { Session, SessionPOJO } from '@/models/session-models';
import { assertUnreachable } from '@/utils/assert-unreachable';
import { LiftLog } from '@/gen/proto';
import {
  toStringValue,
  toTimestampDao,
  toUuidDao,
} from './storage/conversions.to-dao';

export interface FeedUserPOJO {
  type: 'FeedUser';
  id: string;
  publicKey: RsaPublicKey;
  name: string | undefined;
  nickname: string | undefined;
  currentPlan: SessionBlueprintPOJO[];
  profilePicture: Uint8Array | undefined;
  aesKey: AesKey | undefined;
  followSecret: string | undefined;
}

export class FeedUser {
  constructor(
    readonly id: string,
    readonly publicKey: RsaPublicKey,
    readonly name: string | undefined,
    readonly nickname: string | undefined,
    readonly currentPlan: SessionBlueprint[],
    readonly profilePicture: Uint8Array | undefined,
    readonly aesKey: AesKey | undefined,
    readonly followSecret: string | undefined,
  ) {}

  static fromPOJO(pojo: Omit<FeedUserPOJO, 'type'>): FeedUser {
    return new FeedUser(
      pojo.id,
      pojo.publicKey,
      pojo.name,
      pojo.nickname,
      pojo.currentPlan.map(SessionBlueprint.fromPOJO),
      pojo.profilePicture,
      pojo.aesKey,
      pojo.followSecret,
    );
  }

  toPOJO(): FeedUserPOJO {
    return {
      type: 'FeedUser',
      id: this.id,
      publicKey: this.publicKey,
      name: this.name,
      nickname: this.nickname,
      currentPlan: this.currentPlan.map((session) => session.toPOJO()),
      profilePicture: this.profilePicture,
      aesKey: this.aesKey,
      followSecret: this.followSecret,
    };
  }

  toDao(): LiftLog.Ui.Models.FeedUserDaoV1 {
    return new LiftLog.Ui.Models.FeedUserDaoV1({
      id: toUuidDao(this.id),
      name: toStringValue(this.name),
      nickname: toStringValue(this.nickname),
      aesKey: this.aesKey?.value ?? null,
      publicKey: this.publicKey.spkiPublicKeyBytes,
      currentPlan: this.currentPlan ? toCurrentPlanDao(this.currentPlan) : null,
      profilePicture: this.profilePicture ?? null,
      followSecret: toStringValue(this.followSecret),
    });
  }

  with(other: Partial<FeedUserPOJO>): FeedUser {
    return new FeedUser(
      other.id ?? this.id,
      other.publicKey ?? this.publicKey,
      other.name ?? this.name,
      other.nickname ?? this.nickname,
      other.currentPlan
        ? other.currentPlan.map(SessionBlueprint.fromPOJO)
        : this.currentPlan,
      other.profilePicture ?? this.profilePicture,
      other.aesKey ?? this.aesKey,
      other.followSecret ?? this.followSecret,
    );
  }

  get displayName(): string {
    return this.nickname ?? this.name ?? 'Anonymous User';
  }

  static fromShared(
    id: string,
    publicKey: RsaPublicKey,
    name: string | undefined,
  ): FeedUser {
    return new FeedUser(
      id,
      publicKey,
      name,
      undefined,
      [],
      undefined,
      undefined,
      undefined,
    );
  }
}

export interface FeedItemPOJO {
  type: 'SessionFeedItem' | 'REMOVED_SessionFeedItem';
  userId: string;
  eventId: string;
  timestamp: Instant;
  expiry: Instant;
}

export abstract class FeedItem {
  readonly userId: string;
  readonly eventId: string;
  readonly timestamp: Instant;
  readonly expiry: Instant;

  constructor(
    userId: string,
    eventId: string,
    timestamp: Instant,
    expiry: Instant,
  ) {
    this.userId = userId;
    this.eventId = eventId;
    this.timestamp = timestamp;
    this.expiry = expiry;
  }

  abstract toPOJO(): FeedItemPOJO;

  abstract toDao(): LiftLog.Ui.Models.FeedItemDaoV1;

  static fromPOJO(x: FeedItemPOJO): FeedItem {
    switch (x.type) {
      case 'REMOVED_SessionFeedItem':
        return new RemovedSessionFeedItem(
          x.userId,
          x.eventId,
          x.timestamp,
          x.expiry,
          (x as RemovedSessionFeedItemPOJO).sessionId,
        );
      case 'SessionFeedItem':
        return new SessionFeedItem(
          x.userId,
          x.eventId,
          x.timestamp,
          x.expiry,
          Session.fromPOJO((x as SessionFeedItemPOJO).session),
        );
    }
  }
}

export interface SessionFeedItemPOJO extends FeedItemPOJO {
  session: SessionPOJO;
}

export class SessionFeedItem extends FeedItem {
  readonly session: Session;

  constructor(
    userId: string,
    eventId: string,
    timestamp: Instant,
    expiry: Instant,
    session: Session,
  ) {
    super(userId, eventId, timestamp, expiry);
    this.session = session;
  }

  toPOJO(): SessionFeedItemPOJO {
    return {
      type: 'SessionFeedItem',
      eventId: this.eventId,
      expiry: this.expiry,
      session: this.session.toPOJO(),
      timestamp: this.timestamp,
      userId: this.userId,
    };
  }

  toDao(): LiftLog.Ui.Models.FeedItemDaoV1 {
    return new LiftLog.Ui.Models.FeedItemDaoV1({
      eventId: toUuidDao(this.eventId),
      expiry: toTimestampDao(this.expiry),
      timestamp: toTimestampDao(this.timestamp),
      userId: toUuidDao(this.userId),
      session: this.session.toDao(),
    });
  }
}

export interface RemovedSessionFeedItemPOJO extends FeedItemPOJO {
  sessionId: string;
}

export class RemovedSessionFeedItem extends FeedItem {
  readonly sessionId: string;

  constructor(
    userId: string,
    eventId: string,
    timestamp: Instant,
    expiry: Instant,
    sessionId: string,
  ) {
    super(userId, eventId, timestamp, expiry);
    this.sessionId = sessionId;
  }

  toPOJO(): RemovedSessionFeedItemPOJO {
    return {
      type: 'REMOVED_SessionFeedItem',
      eventId: this.eventId,
      expiry: this.expiry,
      sessionId: this.sessionId,
      timestamp: this.timestamp,
      userId: this.userId,
    };
  }

  toDao(): LiftLog.Ui.Models.FeedItemDaoV1 {
    return new LiftLog.Ui.Models.FeedItemDaoV1({
      eventId: toUuidDao(this.eventId),
      expiry: toTimestampDao(this.expiry),
      timestamp: toTimestampDao(this.timestamp),
      userId: toUuidDao(this.userId),
    });
  }
}

export interface FeedIdentityPOJO {
  type: 'FeedIdentity';
  id: string;
  lookup: string;
  aesKey: AesKey;
  rsaKeyPair: RsaKeyPair;
  password: string;
  name: string | undefined;
  profilePicture: Uint8Array | undefined;
  publishBodyweight: boolean;
  publishPlan: boolean;
  publishWorkouts: boolean;
}

export class FeedIdentity {
  constructor(
    readonly id: string,
    readonly lookup: string,
    readonly aesKey: AesKey,
    readonly rsaKeyPair: RsaKeyPair,
    readonly password: string,
    readonly name: string | undefined,
    readonly profilePicture: Uint8Array | undefined,
    readonly publishBodyweight: boolean,
    readonly publishPlan: boolean,
    readonly publishWorkouts: boolean,
  ) {}

  static fromPOJO(pojo: Omit<FeedIdentityPOJO, 'type'>): FeedIdentity {
    return new FeedIdentity(
      pojo.id,
      pojo.lookup,
      pojo.aesKey,
      pojo.rsaKeyPair,
      pojo.password,
      pojo.name,
      pojo.profilePicture,
      pojo.publishBodyweight,
      pojo.publishPlan,
      pojo.publishWorkouts,
    );
  }

  toPOJO(): FeedIdentityPOJO {
    return {
      type: 'FeedIdentity',
      id: this.id,
      lookup: this.lookup,
      aesKey: this.aesKey,
      rsaKeyPair: this.rsaKeyPair,
      password: this.password,
      name: this.name,
      profilePicture: this.profilePicture,
      publishBodyweight: this.publishBodyweight,
      publishPlan: this.publishPlan,
      publishWorkouts: this.publishWorkouts,
    };
  }

  toDao(): LiftLog.Ui.Models.FeedIdentityDaoV1 {
    return new LiftLog.Ui.Models.FeedIdentityDaoV1({
      id: toUuidDao(this.id),
      lookup: { value: this.lookup },
      aesKey: this.aesKey.value,
      publicKey: this.rsaKeyPair.publicKey.spkiPublicKeyBytes,
      privateKey: this.rsaKeyPair.privateKey.pkcs8PrivateKeyBytes,
      password: this.password,
      name: toStringValue(this.name),
      profilePicture: this.profilePicture ?? null,
      publishBodyweight: this.publishBodyweight,
      publishPlan: this.publishPlan,
      publishWorkouts: this.publishWorkouts,
    });
  }

  with(other: Partial<FeedIdentityPOJO>): FeedIdentity {
    return new FeedIdentity(
      other.id ?? this.id,
      other.lookup ?? this.lookup,
      other.aesKey ?? this.aesKey,
      other.rsaKeyPair ?? this.rsaKeyPair,
      other.password ?? this.password,
      other.name ?? this.name,
      other.profilePicture ?? this.profilePicture,
      other.publishBodyweight ?? this.publishBodyweight,
      other.publishPlan ?? this.publishPlan,
      other.publishWorkouts ?? this.publishWorkouts,
    );
  }
}

export interface FollowRequestPOJO {
  type: 'FollowRequest';
  userId: string;
  name: string | undefined;
}

export class FollowRequest {
  constructor(
    readonly userId: string,
    readonly name: string | undefined,
  ) {
    this.userId = userId!;
    this.name = name!;
  }

  static fromPOJO(pojo: Omit<FollowRequestPOJO, 'type'>): FollowRequest {
    return new FollowRequest(pojo.userId, pojo.name);
  }

  toPOJO(): FollowRequestPOJO {
    return {
      type: 'FollowRequest',
      userId: this.userId,
      name: this.name,
    };
  }

  toDao(): LiftLog.Ui.Models.InboxMessageDao {
    return new LiftLog.Ui.Models.InboxMessageDao({
      fromUserId: toUuidDao(this.userId),
      followRequest: {
        name: toStringValue(this.name),
      },
    });
  }

  with(other: Partial<FollowRequestPOJO>): FollowRequest {
    return new FollowRequest(
      other.userId ?? this.userId,
      other.name ?? this.name,
    );
  }
}

export interface FollowResponsePOJO {
  type: 'FollowResponse';
  userId: string;
  accepted: boolean;
  aesKey: AesKey | undefined;
  followSecret: string | undefined;
}

export class FollowResponse {
  constructor(
    readonly userId: string,
    readonly accepted: boolean,
    readonly aesKey: AesKey | undefined,
    readonly followSecret: string | undefined,
  ) {}

  static fromPOJO(pojo: Omit<FollowResponsePOJO, 'type'>): FollowResponse {
    return new FollowResponse(
      pojo.userId,
      pojo.accepted,
      pojo.aesKey,
      pojo.followSecret,
    );
  }

  toPOJO(): FollowResponsePOJO {
    return {
      type: 'FollowResponse',
      userId: this.userId,
      accepted: this.accepted,
      aesKey: this.aesKey,
      followSecret: this.followSecret,
    };
  }

  with(other: Partial<FollowResponsePOJO>): FollowResponse {
    return new FollowResponse(
      other.userId ?? this.userId,
      other.accepted ?? this.accepted,
      other.aesKey ?? this.aesKey,
      other.followSecret ?? this.followSecret,
    );
  }
}

export type SharedItemPOJO = SharedProgramBlueprintPOJO | SharedSessionPOJO;

export abstract class SharedItem {
  abstract toPOJO(): SharedItemPOJO;

  static fromPOJO(pojo: SharedItemPOJO): SharedItem {
    if (pojo.type === 'SHARED_ProgramBlueprint') {
      return new SharedProgramBlueprint(
        ProgramBlueprint.fromPOJO(pojo.programBlueprint),
      );
    }
    if (pojo.type === 'SHARED_Session') {
      return new SharedSession(Session.fromPOJO(pojo.session));
    }
    assertUnreachable(pojo);
  }

  abstract toDao(): LiftLog.Ui.Models.SharedItemPayload;
}

export interface SharedProgramBlueprintPOJO {
  type: 'SHARED_ProgramBlueprint';
  programBlueprint: ProgramBlueprintPOJO;
}
export class SharedProgramBlueprint extends SharedItem {
  readonly programBlueprint: ProgramBlueprint;

  constructor(programBlueprint: ProgramBlueprint) {
    super();
    this.programBlueprint = programBlueprint!;
  }

  toPOJO(): SharedProgramBlueprintPOJO {
    return {
      type: 'SHARED_ProgramBlueprint',
      programBlueprint: this.programBlueprint.toPOJO(),
    };
  }

  with(
    other: Partial<{ programBlueprint: ProgramBlueprint }>,
  ): SharedProgramBlueprint {
    return new SharedProgramBlueprint(
      other.programBlueprint ?? this.programBlueprint,
    );
  }

  toDao(): LiftLog.Ui.Models.SharedItemPayload {
    return new LiftLog.Ui.Models.SharedItemPayload({
      sharedProgramBlueprint: {
        programBlueprint: this.programBlueprint.toDao(),
      },
    });
  }
}

export interface SharedSessionPOJO {
  type: 'SHARED_Session';
  session: SessionPOJO;
}
export class SharedSession extends SharedItem {
  readonly session: Session;

  constructor(session: Session) {
    super();
    this.session = session!;
  }

  toPOJO(): SharedSessionPOJO {
    return {
      type: 'SHARED_Session',
      session: this.session.toPOJO(),
    };
  }

  with(other: Partial<{ session: Session }>): SharedSession {
    return new SharedSession(other.session ?? this.session);
  }

  toDao(): LiftLog.Ui.Models.SharedItemPayload {
    return new LiftLog.Ui.Models.SharedItemPayload({
      sharedSession: {
        session: this.session.toDao(),
      },
    });
  }
}

export function toCurrentPlanDao(
  sessions: SessionBlueprint[],
): LiftLog.Ui.Models.CurrentPlanDaoV1 {
  return new LiftLog.Ui.Models.CurrentPlanDaoV1({
    sessions: sessions.map((x) => x.toDao()),
  });
}
