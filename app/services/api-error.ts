import type { FetchResponse } from 'expo/build/winter/fetch/FetchResponse';

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

export class ResponseError extends Error {
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

  isError(): this is { error: ApiError } {
    return !!this.error;
  }

  static success(): ApiResult<void>;
  static success<T>(data: T): ApiResult<T>;
  static success<T>(data?: T): ApiResult<T> {
    return new ApiResult(data);
  }

  static fromError<T>(err: ApiError): ApiResult<T> {
    return new ApiResult<T>(undefined, err);
  }

  static fromFailure<T>(other: ApiResult<unknown>): ApiResult<T> {
    return new ApiResult<T>(undefined, other.error);
  }
}
