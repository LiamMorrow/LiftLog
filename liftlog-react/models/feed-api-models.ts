import {
  AesEncryptedAndRsaSignedData,
  RsaPublicKey,
} from '@/models/encryption-models';

export type GetUsersRequest = {
  ids: string[]; // Guid is represented as string in TypeScript
};

export type DeleteUserRequest = {
  id: string;
  password: string;
};

export type GetUsersResponse = {
  users: Record<string, GetUserResponse>; // Dictionary<Guid, T> is represented as Record<string, T>
};

export type CreateUserResponse = {
  id: string;
  lookup: string;
  password: string;
};

export type PutUserDataRequest = {
  id: string;
  password: string;
  encryptedCurrentPlan: Uint8Array | undefined;
  encryptedProfilePicture: Uint8Array | undefined;
  encryptedName: Uint8Array | undefined;
  encryptionIV: Uint8Array;
  rsaPublicKey: Uint8Array;
};

export type GetUserResponse = {
  id: string;
  lookup: string;
  encryptedCurrentPlan: Uint8Array | undefined;
  encryptedProfilePicture: Uint8Array | undefined;
  encryptedName: Uint8Array | undefined;
  encryptionIV: Uint8Array;
  rsaPublicKey: Uint8Array;
};

export type PutUserEventRequest = {
  userId: string;
  password: string;
  eventId: string;
  encryptedEventPayload: Uint8Array;
  encryptedEventIV: Uint8Array;
  expiry: string; // DateTimeOffset is represented as ISO string in TypeScript
};

export type GetUserEventRequest = {
  userId: string;
  followSecret: string;
  since: string; // DateTimeOffset is represented as ISO string in TypeScript
};

export type GetEventsRequest = {
  users: GetUserEventRequest[];
};

export type UserEventResponse = {
  userId: string;
  eventId: string;
  timestamp: string; // DateTimeOffset is represented as ISO string in TypeScript
  encryptedEventPayload: Uint8Array;
  encryptedEventIV: Uint8Array;
  expiry: string; // DateTimeOffset is represented as ISO string in TypeScript
};

export type GetEventsResponse = {
  events: UserEventResponse[];
  invalidFollowSecrets: string[];
};

export type PutInboxMessageRequest = {
  toUserId: string;
  encryptedMessage: Uint8Array[];
};

export type GetInboxMessagesRequest = {
  userId: string;
  password: string;
};

export type GetInboxMessageResponse = {
  id: string;
  encryptedMessage: Uint8Array[];
};

export type GetInboxMessagesResponse = {
  inboxMessages: GetInboxMessageResponse[];
};

export type PutUserFollowSecretRequest = {
  userId: string;
  password: string;
  followSecret: string;
};

export type DeleteUserFollowSecretRequest = {
  userId: string;
  password: string;
  followSecret: string;
}; // Adjust the import path as needed

export type CreateSharedItemRequest = {
  userId: string;
  password: string;
  encryptedPayload: AesEncryptedAndRsaSignedData;
  expiry: string; // DateTimeOffset is represented as ISO string in TypeScript
};

export type CreateSharedItemResponse = {
  id: string;
};

export type GetSharedItemResponse = {
  rsaPublicKey: RsaPublicKey;
  encryptedPayload: AesEncryptedAndRsaSignedData;
};
