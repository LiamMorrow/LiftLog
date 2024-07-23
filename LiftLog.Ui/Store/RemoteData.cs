using System.Diagnostics.CodeAnalysis;

namespace LiftLog.Ui.Store;

public static class RemoteData
{
    public static RemoteLoading Loading => new();

    public static RemoteError Errored(string error) => new(error);

    public static RemoteData<T> Success<T>(T data) => new RemoteSuccess<T>(data);

    public static RemoteNotAsked NotAsked => new();
}

public abstract class RemoteData<T>
{
    public static implicit operator RemoteData<T>(RemoteLoading _) => new RemoteLoading<T>();

    public static implicit operator RemoteData<T>(RemoteError err) => new RemoteError<T>(err.Error);

    public static implicit operator RemoteData<T>(RemoteNotAsked _) => new RemoteNotAsked<T>();

    public abstract T? Data { get; }

    public abstract string? Error { get; }

    public abstract bool IsLoading { get; }

    [MemberNotNullWhen(true, nameof(Error))]
    public abstract bool IsError { get; }

    [MemberNotNullWhen(true, nameof(Data))]
    public abstract bool IsSuccess { get; }

    public bool IsNotAsked => !IsLoading && !IsError && !IsSuccess;

    public abstract RemoteData<TResult> Map<TResult>(Func<T, TResult> mapper);

    public T UnwrapOr(T defaultValue) => IsSuccess ? Data : defaultValue;
}

public class RemoteSuccess<T>(T data) : RemoteData<T>
{
    public override T Data => data;
    public override bool IsLoading => false;
    public override bool IsError => false;
    public override bool IsSuccess => true;

    public override string? Error => null;

    public override RemoteData<TResult> Map<TResult>(Func<T, TResult> mapper) =>
        new RemoteSuccess<TResult>(mapper(Data));
}

public readonly record struct RemoteError(string Error);

public class RemoteError<T>(string error) : RemoteData<T>
{
    public override string Error => error;

    public override T? Data => default;
    public override bool IsLoading => false;
    public override bool IsError => true;
    public override bool IsSuccess => false;

    public override RemoteData<TResult> Map<TResult>(Func<T, TResult> mapper) =>
        new RemoteError<TResult>(error);
}

public class RemoteLoading<T> : RemoteData<T>
{
    public override T? Data => default;

    public override string? Error => null;

    public override bool IsLoading => true;
    public override bool IsError => false;
    public override bool IsSuccess => false;

    public override RemoteData<TResult> Map<TResult>(Func<T, TResult> mapper) =>
        new RemoteLoading<TResult>();
}

public readonly struct RemoteLoading { }

public class RemoteNotAsked<T> : RemoteData<T>
{
    public override T? Data => default;

    public override string? Error => null;

    public override bool IsLoading => false;
    public override bool IsError => false;
    public override bool IsSuccess => false;

    public override RemoteData<TResult> Map<TResult>(Func<T, TResult> mapper) =>
        new RemoteNotAsked<TResult>();
}

public readonly struct RemoteNotAsked { }
