import type {
  AesKeyJSON,
  Base64Uint8ArrayJSON,
  InstantJSON,
  JsonString,
  RsaKeyPairJSON,
  RsaPublicKeyJSON,
} from '@/models/storage/versions/libs';
import type { ProgramBlueprintJSON } from '@/models/storage/versions/latest/blueprint';
import type { SessionJSON } from '@/models/storage/versions/latest/session';

export interface PreviousAesKeyJSON {
  key: AesKeyJSON;
  supersededAt: InstantJSON;
}

export interface FeedIdentityJSON {
  version: 2;
  id: string;
  lookup: string;
  aesKey: AesKeyJSON;
  previousAesKeys: PreviousAesKeyJSON[];
  rsaKeyPair: RsaKeyPairJSON;
  password: string;
  name: string | undefined;
  publishBodyweight: boolean;
  publishPlan: boolean;
  publishWorkouts: boolean;
}

export type FriendStatusJSON = 'incoming' | 'pending' | 'friend' | 'legacyFollowing' | 'legacyFollower';

export interface FriendJSON {
  id: string;
  publicKey: RsaPublicKeyJSON;
  name: string | undefined;
  currentPlan: ProgramBlueprintJSON | undefined;
  status: FriendStatusJSON;
  theirKeys: AesKeyJSON[];
  theirKeysSentAt: InstantJSON | undefined;
  theirSecret: string | undefined;
  mySecret: string | undefined;
}

interface UserEventBaseJSON {
  userId: string;
  eventId: string;
  timestamp: InstantJSON;
  expiry: InstantJSON;
}

export interface SessionUserEventJSON extends UserEventBaseJSON {
  version: 3;
  type: 'SessionUserEvent';
  session: SessionJSON;
}

export interface RemovedSessionUserEventJSON extends UserEventBaseJSON {
  type: 'RemovedSessionUserEvent';
  sessionId: string;
}

export interface LiveSessionUserEventJSON extends UserEventBaseJSON {
  type: 'LiveSessionUserEvent';
  session: SessionJSON;
}

export type UserEventJSON = SessionUserEventJSON | RemovedSessionUserEventJSON | LiveSessionUserEventJSON;

interface InboxMessageBaseJSON<TType extends string, T> {
  senderUserId: string;
  type: TType;
  // This is stringified json to ensure the signature can be verified consistently
  payloadJson: JsonString<T>;
  // [payloadJson||senderUserId||receiverUserId] signed with the private key of the sender
  signature: Base64Uint8ArrayJSON;
}

export interface FollowRequestJSON {
  name: string | undefined;
}

// Sent from a user when they wish to accept someone's follow request
export interface AcceptedFollowResponseJSON {
  type: 'AcceptedFollowResponse';
  aesKey: AesKeyJSON;
  followSecret: string;
}

export interface RejectedFollowResponseJSON {
  type: 'RejectedFollowResponse';
}

export interface FollowResponseJSON {
  response: AcceptedFollowResponseJSON | RejectedFollowResponseJSON;
}

export interface UnfollowNotificationJSON {
  // The follow secret which has been revoked
  followSecret: string;
}

export interface ReactionJSON {
  reactionId: string;
  // The id of the SessionUserEvent being cheered
  eventId: string;
  // Permissive here, narrowed to the allowlist in the domain model. Persisted data must survive values the
  // current app version doesn't recognise.
  emoji: string;
  count: number;
  reactedAt: InstantJSON;
}

export interface InboxDeliveryJSON {
  messageId: string;
  sentAt: InstantJSON;
}

export interface FriendRequestJSON {
  name: string | undefined;
}

export interface FriendKeysJSON {
  aesKeys: AesKeyJSON[];
  followSecret: string;
}

export type FriendRejectJSON = Record<string, never>;

export type UnfriendJSON = Record<string, never>;

export type FollowRequestInboxMessageJSON = InboxMessageBaseJSON<'FollowRequest', FollowRequestJSON>;
export type FollowResponseInboxMessageJSON = InboxMessageBaseJSON<'FollowResponse', FollowResponseJSON>;
export type UnfollowNotificationInboxMessageJSON = InboxMessageBaseJSON<
  'UnfollowNotification',
  UnfollowNotificationJSON
>;
export type ReactionInboxMessageJSON = InboxMessageBaseJSON<'Reaction', ReactionJSON>;
export type FriendRequestInboxMessageJSON = InboxMessageBaseJSON<'FriendRequest', FriendRequestJSON>;
export type FriendKeysInboxMessageJSON = InboxMessageBaseJSON<'FriendKeys', FriendKeysJSON>;
export type FriendRejectInboxMessageJSON = InboxMessageBaseJSON<'FriendReject', FriendRejectJSON>;
export type UnfriendInboxMessageJSON = InboxMessageBaseJSON<'Unfriend', UnfriendJSON>;

export type InboxMessageJSON =
  | FollowRequestInboxMessageJSON
  | FollowResponseInboxMessageJSON
  | UnfollowNotificationInboxMessageJSON
  | ReactionInboxMessageJSON
  | FriendRequestInboxMessageJSON
  | FriendKeysInboxMessageJSON
  | FriendRejectInboxMessageJSON
  | UnfriendInboxMessageJSON;

/** A cheer someone sent you. Only ever visible to the author of the cheered workout. */
export interface ReceivedReactionJSON {
  id: string;
  eventId: string;
  fromUserId: string;
  emoji: string;
  count: number;
  reactedAt: InstantJSON;
}

/** A cheer you sent. The server deletes inbox messages on read, so this is the only record of it. */
export interface SentReactionJSON {
  id: string;
  eventId: string;
  emoji: string;
  count: number;
  reactedAt: InstantJSON;
}

export interface SharedProgramBlueprintJSON {
  version: 3;
  type: 'SharedProgramBlueprint';
  programBlueprint: ProgramBlueprintJSON;
}

export interface SharedSessionJSON {
  version: 3;
  type: 'SharedSession';
  session: SessionJSON;
}

export type SharedItemJSON = SharedProgramBlueprintJSON | SharedSessionJSON;
