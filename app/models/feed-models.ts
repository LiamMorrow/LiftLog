import { Instant } from '@js-joda/core';
import {
  ProgramBlueprint,
  ProgramBlueprintPOJO,
  SessionBlueprint,
  SessionBlueprintPOJO,
} from './blueprint-models';
import { RsaPublicKey, AesKey, RsaKeyPair } from '@/models/encryption-models';
import { Session, SessionPOJO } from '@/models/session-models';

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
  readonly id: string;
  readonly publicKey: RsaPublicKey;
  readonly name: string | undefined;
  readonly nickname: string | undefined;
  readonly currentPlan: SessionBlueprint[];
  readonly profilePicture: Uint8Array | undefined;
  readonly aesKey: AesKey | undefined;
  readonly followSecret: string | undefined;

  /**
   * @deprecated please use full constructor. Here only for serialization
   */
  constructor();
  constructor(
    id: string,
    publicKey: RsaPublicKey,
    name: string | undefined,
    nickname: string | undefined,
    currentPlan: SessionBlueprint[],
    profilePicture: Uint8Array | undefined,
    aesKey: AesKey | undefined,
    followSecret: string | undefined,
  );
  constructor(
    id?: string,
    publicKey?: RsaPublicKey,
    name?: string,
    nickname?: string,
    currentPlan?: SessionBlueprint[],
    profilePicture?: Uint8Array,
    aesKey?: AesKey,
    followSecret?: string,
  ) {
    this.id = id!;
    this.publicKey = publicKey!;
    this.name = name!;
    this.nickname = nickname!;
    this.currentPlan = currentPlan!;
    this.profilePicture = profilePicture!;
    this.aesKey = aesKey!;
    this.followSecret = followSecret!;
  }

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
  readonly id: string;
  readonly lookup: string;
  readonly aesKey: AesKey;
  readonly rsaKeyPair: RsaKeyPair;
  readonly password: string;
  readonly name: string | undefined;
  readonly profilePicture: Uint8Array | undefined;
  readonly publishBodyweight: boolean;
  readonly publishPlan: boolean;
  readonly publishWorkouts: boolean;

  /**
   * @deprecated please use full constructor. Here only for serialization
   */
  constructor();
  constructor(
    id: string,
    lookup: string,
    aesKey: AesKey,
    rsaKeyPair: RsaKeyPair,
    password: string,
    name: string | undefined,
    profilePicture: Uint8Array | undefined,
    publishBodyweight: boolean,
    publishPlan: boolean,
    publishWorkouts: boolean,
  );
  constructor(
    id?: string,
    lookup?: string,
    aesKey?: AesKey,
    rsaKeyPair?: RsaKeyPair,
    password?: string,
    name?: string,
    profilePicture?: Uint8Array,
    publishBodyweight?: boolean,
    publishPlan?: boolean,
    publishWorkouts?: boolean,
  ) {
    this.id = id!;
    this.lookup = lookup!;
    this.aesKey = aesKey!;
    this.rsaKeyPair = rsaKeyPair!;
    this.password = password!;
    this.name = name!;
    this.profilePicture = profilePicture!;
    this.publishBodyweight = publishBodyweight!;
    this.publishPlan = publishPlan!;
    this.publishWorkouts = publishWorkouts!;
  }

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
  readonly userId: string;
  readonly name: string | undefined;

  /**
   * @deprecated please use full constructor. Here only for serialization
   */
  constructor();
  constructor(userId: string, name: string | undefined);
  constructor(userId?: string, name?: string) {
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
  readonly userId: string;
  readonly accepted: boolean;
  readonly aesKey: AesKey | undefined;
  readonly followSecret: string | undefined;

  /**
   * @deprecated please use full constructor. Here only for serialization
   */
  constructor();
  constructor(
    userId: string,
    accepted: boolean,
    aesKey: AesKey | undefined,
    followSecret: string | undefined,
  );
  constructor(
    userId?: string,
    accepted?: boolean,
    aesKey?: AesKey,
    followSecret?: string,
  ) {
    this.userId = userId!;
    this.accepted = accepted!;
    this.aesKey = aesKey!;
    this.followSecret = followSecret!;
  }

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

export type SharedItemPOJO = SharedProgramBlueprintPOJO;

export abstract class SharedItem {
  abstract toPOJO(): SharedItemPOJO;

  static fromPOJO(pojo: SharedItemPOJO): SharedItem {
    if (pojo.type === 'SHARED_ProgramBlueprint') {
      return new SharedProgramBlueprint(
        ProgramBlueprint.fromPOJO(pojo.programBlueprint),
      );
    }
    throw new Error('Unknown type');
  }
}

export interface SharedProgramBlueprintPOJO {
  type: 'SHARED_ProgramBlueprint';
  programBlueprint: ProgramBlueprintPOJO;
}
export class SharedProgramBlueprint extends SharedItem {
  readonly programBlueprint: ProgramBlueprint;

  /**
   * @deprecated please use full constructor. Here only for serialization
   */
  constructor();
  constructor(programBlueprint: ProgramBlueprint);
  constructor(programBlueprint?: ProgramBlueprint) {
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
}
