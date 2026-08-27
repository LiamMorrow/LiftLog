using System.Net.Http.Json;
using LiftLog.Lib.Models;

namespace LiftLog.Tests.Api.Integration.Helpers;

public static class FeedHelper
{
    private static readonly byte[] encryptionIV = Enumerable.Repeat((byte)0x04, 16).ToArray();
    private static readonly byte[] rsaPublicKey = Enumerable.Repeat((byte)0x05, 16).ToArray();

    public static Task<CreateUserResponse> CreateUserAsync(HttpClient client) =>
        UserHelper.CreateUserAsync(client, encryptionIV, rsaPublicKey)!;

    public static async Task AddFollowSecretAsync(
        HttpClient client,
        CreateUserResponse user,
        string followSecret
    ) =>
        (
            await client.PutAsJsonAsync(
                "/follow-secret",
                new PutUserFollowSecretRequest(user.Id, user.Password, followSecret)
            )
        ).EnsureSuccessStatusCode();

    public static async Task<Guid> PublishEventAsync(
        HttpClient client,
        CreateUserResponse user,
        DateTimeOffset expiry,
        byte[]? payload = null,
        Guid? eventId = null
    )
    {
        var id = eventId ?? Guid.NewGuid();
        (
            await client.PutAsJsonAsync(
                "/event",
                new PutUserEventRequest(
                    user.Id,
                    user.Password,
                    id,
                    payload ?? [0x01, 0x02, 0x03],
                    encryptionIV,
                    expiry
                )
            )
        ).EnsureSuccessStatusCode();
        return id;
    }

    public static async Task<GetEventsResponse> GetEventsAsync(
        HttpClient client,
        params GetUserEventRequest[] users
    )
    {
        var response = await client.PostAsJsonAsync("/events", new GetEventsRequest(users));
        response.EnsureSuccessStatusCode();
        return (await response.Content.ReadFromJsonAsync<GetEventsResponse>())!;
    }
}
