import {
  GetEventsRequest,
  GetEventsResponse,
  CreateUserResponse,
  GetUserResponse,
  PutUserDataRequest,
  PutUserEventRequest,
  GetUsersRequest,
  GetUsersResponse,
  DeleteUserRequest,
  PutInboxMessageRequest,
  GetInboxMessagesRequest,
  GetInboxMessagesResponse,
  PutUserFollowSecretRequest,
  DeleteUserFollowSecretRequest,
  CreateSharedItemRequest,
  CreateSharedItemResponse,
  GetSharedItemResponse,
} from '@/models/feed-api-models';
import { apiBaseUrl } from '@/services/api-consts';
import { ApiErrorType, ApiResult, ResponseError } from '@/services/api-error';
import type { FetchResponse } from 'expo/build/winter/fetch/FetchResponse';
import { fetch } from 'expo/fetch';

type Base64Response<T> = T extends Uint8Array
  ? string
  : T extends Uint8Array | undefined
    ? string | undefined
    : T extends (infer U)[]
      ? Base64Response<U>[]
      : T extends object
        ? { [K in keyof T]: Base64Response<T[K]> }
        : T;

export class FeedApiService {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = apiBaseUrl;
  }

  async getUserEventsAsync(
    request: GetEventsRequest,
  ): Promise<ApiResult<GetEventsResponse>> {
    return this.getApiResultAsync(async () => {
      const response = await fetch(`${this.baseUrl}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: stringify(request),
      });
      this.ensureSuccessStatusCode(response);
      const base64Response =
        (await response.json()) as Base64Response<GetEventsResponse>;
      return {
        events: base64Response.events.map((event) => ({
          userId: event.userId,
          eventId: event.eventId,
          timestamp: event.timestamp,
          encryptedEventPayload: base64ToUint8Array(
            event.encryptedEventPayload,
          ),
          encryptedEventIV: base64ToUint8Array(event.encryptedEventIV),
          expiry: event.expiry,
        })),
        invalidFollowSecrets: base64Response.invalidFollowSecrets,
      };
    });
  }

  async createUserAsync(): Promise<ApiResult<CreateUserResponse>> {
    return this.getApiResultAsync(async () => {
      const response = await fetch(`${this.baseUrl}/user/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      });
      this.ensureSuccessStatusCode(response);
      return (await response.json()) as Base64Response<CreateUserResponse>;
    });
  }

  async getUserAsync(idOrLookup: string): Promise<ApiResult<GetUserResponse>> {
    return this.getApiResultAsync(async () => {
      const response = await fetch(`${this.baseUrl}/user/${idOrLookup}`);
      this.ensureSuccessStatusCode(response);
      const base64Response =
        (await response.json()) as Base64Response<GetUserResponse>;
      return {
        id: base64Response.id,
        lookup: base64Response.lookup,
        encryptedCurrentPlan: base64Response.encryptedCurrentPlan
          ? base64ToUint8Array(base64Response.encryptedCurrentPlan)
          : undefined,
        encryptedProfilePicture: base64Response.encryptedProfilePicture
          ? base64ToUint8Array(base64Response.encryptedProfilePicture)
          : undefined,
        encryptedName: base64Response.encryptedName
          ? base64ToUint8Array(base64Response.encryptedName)
          : undefined,
        encryptionIV: base64ToUint8Array(base64Response.encryptionIV),
        rsaPublicKey: base64ToUint8Array(base64Response.rsaPublicKey),
      };
    });
  }

  async putUserDataAsync(
    request: PutUserDataRequest,
  ): Promise<ApiResult<void>> {
    return this.getApiResultAsync(async () => {
      const response = await fetch(`${this.baseUrl}/user`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: stringify(request),
      });
      this.ensureSuccessStatusCode(response);
    });
  }

  async putUserEventAsync(
    request: PutUserEventRequest,
  ): Promise<ApiResult<void>> {
    return this.getApiResultAsync(async () => {
      const response = await fetch(`${this.baseUrl}/event`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: stringify(request),
      });
      this.ensureSuccessStatusCode(response);
    });
  }

  async getUsersAsync(
    request: GetUsersRequest,
  ): Promise<ApiResult<GetUsersResponse>> {
    return this.getApiResultAsync(async () => {
      const response = await fetch(`${this.baseUrl}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: stringify(request),
      });
      this.ensureSuccessStatusCode(response);
      const base64Response =
        (await response.json()) as Base64Response<GetUsersResponse>;
      return {
        users: Object.fromEntries(
          Object.entries(base64Response.users).map(([key, user]) => [
            key,
            {
              id: user.id,
              lookup: user.lookup,
              encryptedCurrentPlan: user.encryptedCurrentPlan
                ? base64ToUint8Array(user.encryptedCurrentPlan)
                : undefined,
              encryptedProfilePicture: user.encryptedProfilePicture
                ? base64ToUint8Array(user.encryptedProfilePicture)
                : undefined,
              encryptedName: user.encryptedName
                ? base64ToUint8Array(user.encryptedName)
                : undefined,
              encryptionIV: base64ToUint8Array(user.encryptionIV),
              rsaPublicKey: base64ToUint8Array(user.rsaPublicKey),
            },
          ]),
        ),
      };
    });
  }

  async deleteUserAsync(request: DeleteUserRequest): Promise<ApiResult<void>> {
    return this.getApiResultAsync(async () => {
      const response = await fetch(`${this.baseUrl}/user/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: stringify(request),
      });
      this.ensureSuccessStatusCode(response);
    });
  }

  async putInboxMessageAsync(
    request: PutInboxMessageRequest,
  ): Promise<ApiResult<void>> {
    return this.getApiResultAsync(async () => {
      const response = await fetch(`${this.baseUrl}/inbox`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: stringify(request),
      });
      this.ensureSuccessStatusCode(response);
    });
  }

  async getInboxMessagesAsync(
    request: GetInboxMessagesRequest,
  ): Promise<ApiResult<GetInboxMessagesResponse>> {
    return this.getApiResultAsync(async () => {
      const response = await fetch(`${this.baseUrl}/inbox`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: stringify(request),
      });
      this.ensureSuccessStatusCode(response);
      const base64Response =
        (await response.json()) as Base64Response<GetInboxMessagesResponse>;
      return {
        inboxMessages: base64Response.inboxMessages.map((message) => ({
          id: message.id,
          encryptedMessage: message.encryptedMessage.map((chunk) =>
            base64ToUint8Array(chunk),
          ),
        })),
      };
    });
  }

  async putUserFollowSecretAsync(
    request: PutUserFollowSecretRequest,
  ): Promise<ApiResult<void>> {
    return this.getApiResultAsync(async () => {
      const response = await fetch(`${this.baseUrl}/follow-secret`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: stringify(request),
      });
      this.ensureSuccessStatusCode(response);
    });
  }

  async deleteUserFollowSecretAsync(
    request: DeleteUserFollowSecretRequest,
  ): Promise<ApiResult<void>> {
    return this.getApiResultAsync(async () => {
      const response = await fetch(`${this.baseUrl}/follow-secret/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: stringify(request),
      });
      this.ensureSuccessStatusCode(response);
    });
  }

  async postSharedItemAsync(
    request: CreateSharedItemRequest,
  ): Promise<ApiResult<CreateSharedItemResponse>> {
    return this.getApiResultAsync(async () => {
      const response = await fetch(`${this.baseUrl}/shareditem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: stringify(request),
      });
      this.ensureSuccessStatusCode(response);
      return (await response.json()) as Base64Response<CreateSharedItemResponse>;
    });
  }

  async getSharedItemAsync(
    sharedItemId: string,
  ): Promise<ApiResult<GetSharedItemResponse>> {
    return this.getApiResultAsync(async () => {
      const response = await fetch(
        `${this.baseUrl}/shareditem/${sharedItemId}`,
      );
      this.ensureSuccessStatusCode(response);
      const base4Response =
        (await response.json()) as Base64Response<GetSharedItemResponse>;
      return {
        encryptedPayload: {
          iv: {
            value: base64ToUint8Array(base4Response.encryptedPayload.iv.value),
          },
          encryptedPayload: base64ToUint8Array(
            base4Response.encryptedPayload.encryptedPayload,
          ),
        },
        rsaPublicKey: {
          spkiPublicKeyBytes: base64ToUint8Array(
            base4Response.rsaPublicKey.spkiPublicKeyBytes,
          ),
        },
      };
    });
  }

  private async getApiResultAsync<T>(
    action: () => Promise<T>,
  ): Promise<ApiResult<T>> {
    try {
      const data = await action();
      return new ApiResult<T>(data);
    } catch (error) {
      if (error instanceof ResponseError) {
        const response = error.response;
        console.debug('Error response', response, await response.text());
        const status = response.status;

        if (status === 404) {
          return ApiResult.fromError({
            type: ApiErrorType.NotFound,
            message: response.statusText,
            exception: error,
          });
        } else if (status === 401) {
          return ApiResult.fromError({
            type: ApiErrorType.Unauthorized,
            message: response.statusText,
            exception: error,
          });
        } else if (status === 429) {
          return ApiResult.fromError({
            type: ApiErrorType.RateLimited,
            message: response.statusText,
            exception: error,
          });
        }
      }

      return ApiResult.fromError({
        type: ApiErrorType.Unknown,
        message:
          (error as { message: string })?.message ||
          'An unknown error occurred',
        exception: error,
      });
    }
  }

  private ensureSuccessStatusCode(response: FetchResponse): void {
    if (!response.ok) {
      throw new ResponseError(response);
    }
  }
}

function stringify(value: unknown): string {
  return JSON.stringify(value, (key, val: unknown) => {
    if (val instanceof Uint8Array) {
      return uint8ArrayToBase64(val);
    }
    return val;
  });
}

function uint8ArrayToBase64(value: Uint8Array): string {
  return btoa(String.fromCharCode(...value));
}

function base64ToUint8Array(value: string): Uint8Array {
  const binaryString = atob(value);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}
