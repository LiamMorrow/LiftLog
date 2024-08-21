using System.Diagnostics.CodeAnalysis;
using System.Net;
using System.Net.Http.Json;
using AutomaticInterface;
using LiftLog.Lib;
using LiftLog.Lib.Models;
using LiftLog.Ui.Store.Feed;

namespace LiftLog.Ui.Services;

[GenerateAutomaticInterface]
public class FeedApiService(HttpClient httpClient
#if DEBUG
    , IDeviceService deviceService
#endif
) : IFeedApiService
{
#if DEBUG
    // Android emulator needs a special loopback address - hacky but works
    private readonly string baseUrl =
        deviceService.GetDeviceType() == DeviceType.Android
            ? "http://10.0.2.2:5264/"
            : "http://127.0.0.1:5264/";
#else
    private static readonly string baseUrl = "https://api.liftlog.online/";
#endif

    public Task<ApiResult<GetEventsResponse>> GetUserEventsAsync(GetEventsRequest request)
    {
        return GetApiResultAsync(async () =>
        {
            var result = (
                await httpClient.PostAsJsonAsync($"{baseUrl}events", request)
            ).EnsureSuccessStatusCode();
            return (await result.Content.ReadFromJsonAsync<GetEventsResponse>())!;
        });
    }

    public Task<ApiResult<CreateUserResponse>> CreateUserAsync(CreateUserRequest request)
    {
        return GetApiResultAsync(async () =>
        {
            var result = (
                await httpClient.PostAsJsonAsync($"{baseUrl}user/create", request)
            ).EnsureSuccessStatusCode();
            return (await result.Content.ReadFromJsonAsync<CreateUserResponse>())!;
        });
    }

    public Task<ApiResult<GetUserResponse>> GetUserAsync(string idOrLookup)
    {
        return GetApiResultAsync(async () =>
        {
            var result = (
                await httpClient.GetAsync($"{baseUrl}user/{idOrLookup}")
            ).EnsureSuccessStatusCode();
            return (await result.Content.ReadFromJsonAsync<GetUserResponse>())!;
        });
    }

    public Task<ApiResult> PutUserDataAsync(PutUserDataRequest request)
    {
        return GetApiResultAsync(async () =>
        {
            (await httpClient.PutAsJsonAsync($"{baseUrl}user", request)).EnsureSuccessStatusCode();
        });
    }

    public Task<ApiResult> PutUserEventAsync(PutUserEventRequest request)
    {
        return GetApiResultAsync(async () =>
        {
            (await httpClient.PutAsJsonAsync($"{baseUrl}event", request)).EnsureSuccessStatusCode();
        });
    }

    public Task<ApiResult<GetUsersResponse>> GetUsersAsync(GetUsersRequest getUsersRequest)
    {
        return GetApiResultAsync(async () =>
        {
            var result = (
                await httpClient.PostAsJsonAsync($"{baseUrl}users", getUsersRequest)
            ).EnsureSuccessStatusCode();
            return (await result.Content.ReadFromJsonAsync<GetUsersResponse>())!;
        });
    }

    public Task<ApiResult> DeleteUserAsync(DeleteUserRequest deleteUserRequest)
    {
        return GetApiResultAsync(async () =>
        {
            (
                await httpClient.PostAsJsonAsync($"{baseUrl}user/delete", deleteUserRequest)
            ).EnsureSuccessStatusCode();
        });
    }

    public Task<ApiResult> PutInboxMessageAsync(PutInboxMessageRequest postInboxMessageRequest)
    {
        return GetApiResultAsync(async () =>
        {
            (
                await httpClient.PutAsJsonAsync($"{baseUrl}inbox", postInboxMessageRequest)
            ).EnsureSuccessStatusCode();
        });
    }

    public Task<ApiResult<GetInboxMessagesResponse>> GetInboxMessagesAsync(
        GetInboxMessagesRequest getInboxMessagesRequest
    )
    {
        return GetApiResultAsync(async () =>
        {
            var result = (
                await httpClient.PostAsJsonAsync($"{baseUrl}inbox", getInboxMessagesRequest)
            ).EnsureSuccessStatusCode();
            return (await result.Content.ReadFromJsonAsync<GetInboxMessagesResponse>())!;
        });
    }

    public Task<ApiResult> PutUserFollowSecretAsync(
        PutUserFollowSecretRequest putFollowSecretRequest
    )
    {
        return GetApiResultAsync(async () =>
        {
            (
                await httpClient.PutAsJsonAsync($"{baseUrl}follow-secret", putFollowSecretRequest)
            ).EnsureSuccessStatusCode();
        });
    }

    public Task<ApiResult> DeleteUserFollowSecretAsync(
        DeleteUserFollowSecretRequest deleteUserFollowSecretRequest
    )
    {
        return GetApiResultAsync(async () =>
        {
            (
                await httpClient.PostAsJsonAsync(
                    $"{baseUrl}follow-secret/delete",
                    deleteUserFollowSecretRequest
                )
            ).EnsureSuccessStatusCode();
        });
    }

    public Task<ApiResult<CreateSharedItemResponse>> PostSharedItemAsync(
        CreateSharedItemRequest request
    )
    {
        return GetApiResultAsync(async () =>
        {
            var result = (
                await httpClient.PostAsJsonAsync($"{baseUrl}shareditem", request)
            ).EnsureSuccessStatusCode();
            return (await result.Content.ReadFromJsonAsync<CreateSharedItemResponse>())!;
        });
    }

    private static async Task<ApiResult<T>> GetApiResultAsync<T>(Func<Task<T>> action)
    {
        try
        {
            return new ApiResult<T>(await action());
        }
        catch (HttpRequestException e) when (e.StatusCode == HttpStatusCode.NotFound)
        {
            return new ApiResult<T>(new ApiError(ApiErrorType.NotFound, e.Message, e));
        }
        catch (HttpRequestException e) when (e.StatusCode == HttpStatusCode.Unauthorized)
        {
            return new ApiResult<T>(new ApiError(ApiErrorType.Unauthorized, e.Message, e));
        }
        catch (HttpRequestException e) when (e.StatusCode == (HttpStatusCode)429)
        {
            return new ApiResult<T>(new ApiError(ApiErrorType.RateLimited, e.Message, e));
        }
        catch (HttpRequestException e)
        {
            return new ApiResult<T>(new ApiError(ApiErrorType.Unknown, e.Message, e));
        }
        catch (Exception e)
        {
            return new ApiResult<T>(new ApiError(ApiErrorType.Unknown, e.Message, e));
        }
    }

    private static async Task<ApiResult> GetApiResultAsync(Func<Task> action)
    {
        // Be explicit here with generic to avoid accidental recursion
        return await GetApiResultAsync<int>(async () =>
        {
            await action();
            return 1;
        });
    }

    public Task<ApiResult<GetSharedItemResponse>> GetSharedItemAsync(string sharedItemId)
    {
        return GetApiResultAsync(async () =>
        {
            var response = await httpClient.GetAsync($"{baseUrl}shareditem/{sharedItemId}");
            return (await response.Content.ReadFromJsonAsync<GetSharedItemResponse>())!;
        });
    }
}

public enum ApiErrorType
{
    Unknown = 0,
    NotFound = 1,
    Unauthorized = 2,
    RateLimited = 3,
    EncryptionError = 4,
}

public record ApiError(ApiErrorType Type, string Message, Exception Exception);

public record ApiResult<T> : ApiResult
{
    public T? Data { get; }

    [MemberNotNullWhen(true, nameof(Data))]
    public override bool IsSuccess => Error is null;

    public ApiResult(T data)
        : base(default(ApiError))
    {
        Data = data;
    }

    public ApiResult(ApiError error)
        : base(error) { }

    public static ApiResult<T> FromFailure(ApiResult other) => new(other.Error!);
}

public record ApiResult(ApiError? Error)
{
    [MemberNotNullWhen(false, nameof(Error))]
    public virtual bool IsSuccess => Error is null;

    public static ApiResult<T> Success<T>(T data) => new ApiResult<T>(data);
}
