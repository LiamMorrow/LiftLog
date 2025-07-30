type RemoteDataMatchHandlers<T, TError, R> = {
  loading: () => R;
  success: (data: T) => R;
  error: (error: TError) => R;
  notAsked?: () => R;
};

export abstract class RemoteData<T, TError = unknown> {
  // Used for serialization in the Redux DevTools.
  protected abstract type: 'notAsked' | 'loading' | 'success' | 'error';

  static notAsked<T>(): RemoteData<T> {
    return new RemoteDataNotAsked<T>();
  }

  static loading<T>(): RemoteData<T> {
    return new RemoteDataLoading<T>();
  }

  static success<T, TError = unknown>(data: T): RemoteData<T, TError> {
    return new RemoteDataSuccess<T>(data);
  }

  static error<T, TError = unknown>(error: TError): RemoteData<T, TError> {
    return new RemoteDataError<T, TError>(error);
  }

  abstract match<R>(handlers: RemoteDataMatchHandlers<T, TError, R>): R;

  isLoading(): this is RemoteDataLoading<T> {
    return this.match({
      loading: () => true,
      error: () => false,
      notAsked: () => false,
      success: () => false,
    });
  }

  isSuccess(): this is RemoteDataSuccess<T> {
    return this.match({
      loading: () => false,
      error: () => false,
      notAsked: () => false,
      success: () => true,
    });
  }

  /**
   * Map the data of the RemoteData to another type.  Only the success state will be mapped.
   * @param successMapper The function to map the data.
   * @returns A new RemoteData with the mapped data.
   */
  map<R>(successMapper: (data: T) => R): RemoteData<R> {
    return this.match({
      notAsked: () => RemoteData.notAsked<R>(),
      loading: () => RemoteData.loading<R>(),
      success: (data) => RemoteData.success(successMapper(data)),
      error: (error) => RemoteData.error(error),
    });
  }

  /**
   * Unwrap the data from the RemoteData.  If the state is not success, the default value will be returned.
   * @param defaultValue The default value to return if the state is not success.
   * @returns The data if the state is success, otherwise the default value.
   */
  unwrapOr<R>(defaultValue: R): T | R {
    return this.match({
      notAsked: () => defaultValue,
      loading: () => defaultValue,
      success: (data) => data as unknown as R,
      error: () => defaultValue,
    });
  }
}

class RemoteDataNotAsked<T> extends RemoteData<T, never> {
  protected type = 'notAsked' as const;

  match<R>(handlers: RemoteDataMatchHandlers<T, never, R>): R {
    return handlers.notAsked?.() ?? handlers.loading();
  }
}

class RemoteDataLoading<T> extends RemoteData<T, never> {
  protected type = 'loading' as const;

  match<R>(handlers: RemoteDataMatchHandlers<T, never, R>): R {
    return handlers.loading();
  }
}

class RemoteDataSuccess<T> extends RemoteData<T, never> {
  constructor(public readonly data: T) {
    super();
  }

  protected type = 'success' as const;

  match<R>(handlers: RemoteDataMatchHandlers<T, never, R>): R {
    return handlers.success(this.data);
  }
}

class RemoteDataError<T, TError> extends RemoteData<T, TError> {
  constructor(private readonly error: TError) {
    super();
  }

  protected type = 'error' as const;

  match<R>(handlers: RemoteDataMatchHandlers<T, TError, R>): R {
    return handlers.error(this.error);
  }
}
