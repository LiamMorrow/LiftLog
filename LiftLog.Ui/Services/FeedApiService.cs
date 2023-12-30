using System.Net.Http.Json;
using LiftLog.Lib;
using LiftLog.Lib.Models;
using LiftLog.Ui.Store.Feed;

namespace LiftLog.Ui.Services;

public class FeedApiService(HttpClient httpClient)
{
#if DEBUG
    private static readonly string baseUrl = "http://localhost:5264/";
#else
    private static readonly string baseUrl = "https://api.liftlog.online/";
#endif

    public async Task<GetEventsResponse> GetUserEventsAsync(GetEventsRequest request)
    {
        // TODO handle 404 etc
        var result = await httpClient.PostAsJsonAsync($"{baseUrl}events", request);
        return (await result.Content.ReadFromJsonAsync<GetEventsResponse>())!;
    }

    public async Task<CreateUserResponse> CreateUserAsync(CreateUserRequest request)
    {
        // TODO handle 404 etc
        var result = await httpClient.PostAsJsonAsync($"{baseUrl}user/create", request);
        return (await result.Content.ReadFromJsonAsync<CreateUserResponse>())!;
    }

    public Task<GetUserResponse> GetUserAsync(Guid id)
    {
        // TODO handle 404 etc
        return httpClient.GetFromJsonAsync<GetUserResponse>($"{baseUrl}user/{id}")!;
    }

    public Task PutUserDataAsync(PutUserDataRequest request)
    {
        return httpClient.PutAsJsonAsync($"{baseUrl}user", request);
    }

    public Task PutUserEventAsync(PutUserEventRequest request)
    {
        return httpClient.PutAsJsonAsync($"{baseUrl}event", request);
    }
}
