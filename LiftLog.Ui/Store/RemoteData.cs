using System.Diagnostics.CodeAnalysis;

namespace LiftLog.Ui.Store;

public static class RemoteData
{
    public static RemoteLoading Loading() => new();

    public static RemoteError Errored(string error) => new(error);

    public static RemoteData<T> Success<T>(T data) => new RemoteSuccess<T>(data);
}

public abstract class RemoteData<T>
{
    public static implicit operator RemoteData<T>(RemoteLoading _) => new RemoteLoading<T>();

    public static implicit operator RemoteData<T>(RemoteError err) => new RemoteError<T>(err.Error);

    public abstract T? Data { get; }

    public abstract string? Error { get; }

    public abstract bool IsLoading { get; }

    [MemberNotNullWhen(true, nameof(Error))]
    public abstract bool IsError { get; }

    [MemberNotNullWhen(true, nameof(Data))]
    public abstract bool IsSuccess { get; }
}

public class RemoteSuccess<T>(T data) : RemoteData<T>
{
    public override T Data => data;
    public override bool IsLoading => false;
    public override bool IsError => false;
    public override bool IsSuccess => true;

    public override string? Error =>
        throw new InvalidOperationException("Cannot access error on a successful RemoteData");
}

public readonly record struct RemoteError(string Error);

public class RemoteError<T>(string error) : RemoteData<T>
{
    public override string Error => error;

    public override T? Data =>
        throw new InvalidOperationException("Cannot access data on an errored RemoteData");
    public override bool IsLoading => false;
    public override bool IsError => true;
    public override bool IsSuccess => false;
}

public class RemoteLoading<T> : RemoteData<T>
{
    public override T? Data =>
        throw new InvalidOperationException("Cannot access data on a loading RemoteData");

    public override string? Error =>
        throw new InvalidOperationException("Cannot access error on a loading RemoteData");

    public override bool IsLoading => true;
    public override bool IsError => false;
    public override bool IsSuccess => false;
}

public readonly struct RemoteLoading { }
