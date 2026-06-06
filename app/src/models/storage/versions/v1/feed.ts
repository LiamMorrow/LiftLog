import { ProgramBlueprintJSON } from './blueprint';
import { SessionJSON } from './session';
import {
  AesKeyJSON,
  Base64Uint8ArrayJSON,
  InstantJSON,
  JsonString,
  RsaKeyPairJSON,
  RsaPublicKeyJSON,
} from '../libs';
import { version } from './version';
export interface PendingFeedUserJSON {
  type: 'PendingFeedUser';
  version?: typeof version;
  id: string;
  publicKey: RsaPublicKeyJSON;
  name: string | undefined;
}
export interface FollowerFeedUserJSON {
  type: 'FollowerFeedUser';
  version?: typeof version;
  id: string;
  publicKey: RsaPublicKeyJSON;
  name: string | undefined;
  followSecret: string;
}

export interface FollowedFeedUserJSON {
  type: 'FollowedFeedUser';
  version?: typeof version;
  id: string;
  publicKey: RsaPublicKeyJSON;
  name: string | undefined;
  currentPlan: ProgramBlueprintJSON | undefined;
  aesKey: AesKeyJSON;
  followSecret: string;
}

export type FeedUserJSON =
  | FollowedFeedUserJSON
  | PendingFeedUserJSON
  | FollowerFeedUserJSON;

export interface UserEventBaseJSON {
  version?: typeof version;
  userId: string;
  eventId: string;
  timestamp: InstantJSON;
  expiry: InstantJSON;
}

export type FeedUserEventJSON =
  | SessionUserEventJSON
  | RemovedSessionUserEventJSON;

export interface SessionUserEventJSON extends UserEventBaseJSON {
  type: 'SessionUserEvent';
  session: SessionJSON;
}

export interface RemovedSessionUserEventJSON extends UserEventBaseJSON {
  type: 'RemovedSessionUserEvent';
  sessionId: string;
}

export interface FeedIdentityJSON {
  version?: typeof version;
  id: string;
  lookup: string;
  aesKey: AesKeyJSON;
  rsaKeyPair: RsaKeyPairJSON;
  password: string;
  name: string | undefined;
  publishBodyweight: boolean;
  publishPlan: boolean;
  publishWorkouts: boolean;
}

export interface InboxMessageBaseJSON<TType extends string, T> {
  version?: typeof version;
  senderUserId: string;
  type: TType;
  // This is stringified json to ensure the signature can be verified consistently
  payloadJson: JsonString<T>;
  // [payloadJson||senderUserId||receiverUserId] signed with the private key of the sender
  // Receivers should fetch the public key of the sender and verify the message is for them by reconstructing this payload
  signature: Base64Uint8ArrayJSON;
}

export type FollowRequestInboxMessageJSON = InboxMessageBaseJSON<
  'FollowRequest',
  FollowRequestJSON
>;
export type FollowResponseInboxMessageJSON = InboxMessageBaseJSON<
  'FollowResponse',
  FollowResponseJSON
>;
export type UnfollowNotificationInboxMessageJSON = InboxMessageBaseJSON<
  'UnfollowNotification',
  UnfollowNotificationJSON
>;

export type InboxMessageJSON =
  | FollowRequestInboxMessageJSON
  | FollowResponseInboxMessageJSON
  | UnfollowNotificationInboxMessageJSON;

export interface FollowRequestJSON {
  name: string | undefined;
}

// Sent from a user when they wish to accept someone's follow request
// Include's the followed user's aesKey and a followSecret the follower can use to get events
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

export type SharedItemJSON = SharedProgramBlueprintJSON | SharedSessionJSON;

export interface SharedProgramBlueprintJSON {
  version?: typeof version;
  type: 'SharedProgramBlueprint';
  programBlueprint: ProgramBlueprintJSON;
}

export interface SharedSessionJSON {
  version?: typeof version;
  type: 'SharedSession';
  session: SessionJSON;
}
