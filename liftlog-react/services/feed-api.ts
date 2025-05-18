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
import { FetchResponse } from 'expo/build/winter/fetch/FetchResponse';
import { fetch } from 'expo/fetch';

export enum ApiErrorType {
  Unknown = 0,
  NotFound = 1,
  Unauthorized = 2,
  RateLimited = 3,
  EncryptionError = 4,
}

export interface ApiError {
  type: ApiErrorType;
  message: string;
  exception: unknown;
}

class ResponseError extends Error {
  constructor(public readonly response: FetchResponse) {
    super('Error during api call');
  }
}

export class ApiResult<T> {
  data?: T;
  error?: ApiError;

  constructor(data?: T, error?: ApiError) {
    this.data = data!;
    this.error = error!;
  }

  isSuccess(): this is { data: T } {
    return !this.error;
  }

  static success<T>(data: T): ApiResult<T> {
    return new ApiResult(data);
  }

  static fromError<T>(err: ApiError): ApiResult<T> {
    return new ApiResult<T>(undefined, err);
  }

  static fromFailure<T>(other: ApiResult<unknown>): ApiResult<T> {
    return new ApiResult<T>(undefined, other.error);
  }
}

type Base64Response<T> = {
  [key in keyof T]: T[key] extends Uint8Array
    ? string
    : T[key] extends object
      ? Base64Response<T[key]>
      : T[key];
};

export class FeedApiService {
  private readonly baseUrl: string;

  constructor() {
    // if (__DEV__) {
    //   this.baseUrl =
    //     Platform.OS === 'android'
    //       ? 'http://10.0.2.2:5264/'
    //       : 'http://127.0.0.1:5264/';
    // } else {
    this.baseUrl = 'https://api.liftlog.online/';
    // }
  }

  async getUserEventsAsync(
    request: GetEventsRequest,
  ): Promise<ApiResult<GetEventsResponse>> {
    return this.getApiResultAsync(async () => {
      const response = await fetch(`${this.baseUrl}events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: stringify(request),
      });
      this.ensureSuccessStatusCode(response);
      return (await response.json()) as GetEventsResponse;
    });
  }

  async createUserAsync(): Promise<ApiResult<CreateUserResponse>> {
    return this.getApiResultAsync(async () => {
      const response = await fetch(`${this.baseUrl}user/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      });
      this.ensureSuccessStatusCode(response);
      return (await response.json()) as CreateUserResponse;
    });
  }

  async getUserAsync(idOrLookup: string): Promise<ApiResult<GetUserResponse>> {
    return this.getApiResultAsync(async () => {
      const response = await fetch(`${this.baseUrl}user/${idOrLookup}`);
      this.ensureSuccessStatusCode(response);
      return (await response.json()) as GetUserResponse;
    });
  }

  async putUserDataAsync(
    request: PutUserDataRequest,
  ): Promise<ApiResult<void>> {
    return this.getApiResultAsync(async () => {
      const response = await fetch(`${this.baseUrl}user`, {
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
      const response = await fetch(`${this.baseUrl}event`, {
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
      const response = await fetch(`${this.baseUrl}users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: stringify(request),
      });
      this.ensureSuccessStatusCode(response);
      return (await response.json()) as GetUsersResponse;
    });
  }

  async deleteUserAsync(request: DeleteUserRequest): Promise<ApiResult<void>> {
    return this.getApiResultAsync(async () => {
      const response = await fetch(`${this.baseUrl}user/delete`, {
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
      const response = await fetch(`${this.baseUrl}inbox`, {
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
      const response = await fetch(`${this.baseUrl}inbox`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: stringify(request),
      });
      this.ensureSuccessStatusCode(response);
      return (await response.json()) as GetInboxMessagesResponse;
    });
  }

  async putUserFollowSecretAsync(
    request: PutUserFollowSecretRequest,
  ): Promise<ApiResult<void>> {
    return this.getApiResultAsync(async () => {
      const response = await fetch(`${this.baseUrl}follow-secret`, {
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
      const response = await fetch(`${this.baseUrl}follow-secret/delete`, {
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
    const body = stringify(request);
    console.log(body);
    return this.getApiResultAsync(async () => {
      const response = await fetch(`${this.baseUrl}shareditem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: stringify(request),
      });
      this.ensureSuccessStatusCode(response);
      return (await response.json()) as CreateSharedItemResponse;
    });
  }

  async getSharedItemAsync(
    sharedItemId: string,
  ): Promise<ApiResult<GetSharedItemResponse>> {
    return this.getApiResultAsync(async () => {
      const response = await fetch(`${this.baseUrl}shareditem/${sharedItemId}`);
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
