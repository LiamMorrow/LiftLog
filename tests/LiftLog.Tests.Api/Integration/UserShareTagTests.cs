using System.Net;
using System.Net.Http.Json;
using LiftLog.Lib.Models;
using LiftLog.Tests.Api.Integration.Providers;

namespace LiftLog.Tests.Api.Integration;

[ClassDataSource<PostgresApiFactory>(Shared = SharedType.PerClass)]
[ClassDataSource<SqliteApiFactory>(Shared = SharedType.PerClass)]
public class UserShareTagTests(ApiFactory factory)
{
    private static readonly byte[] shareTag = Enumerable.Repeat((byte)0x07, 32).ToArray();

    [Test]
    public async Task Get_ReturnsTheShareTagLastPublished()
    {
        var client = factory.CreateClient();
        var user = await FeedHelper.CreateUserAsync(client);

        (await PutUserAsync(client, user, shareTag)).EnsureSuccessStatusCode();

        var body = await client.GetFromJsonAsync<GetUserResponse>($"/user/{user.Lookup}");
        await Assert.That(body!.ShareTag).IsEquivalentTo(shareTag);
    }

    [Test]
    public async Task Put_WithoutAShareTagKeepsThePublishedShareTag()
    {
        var client = factory.CreateClient();
        var user = await FeedHelper.CreateUserAsync(client);
        (await PutUserAsync(client, user, shareTag)).EnsureSuccessStatusCode();

        (await PutUserAsync(client, user, null)).EnsureSuccessStatusCode();

        var body = await client.GetFromJsonAsync<GetUserResponse>($"/user/{user.Id}");
        await Assert.That(body!.ShareTag).IsEquivalentTo(shareTag);
    }

    [Test]
    public async Task Put_WithAShareTagThatIsNotAnHmacSha256ReturnsBadRequest()
    {
        var client = factory.CreateClient();
        var user = await FeedHelper.CreateUserAsync(client);

        var response = await PutUserAsync(client, user, new byte[16]);

        await Assert.That(response.StatusCode).IsEqualTo(HttpStatusCode.BadRequest);
    }

    private static Task<HttpResponseMessage> PutUserAsync(
        HttpClient client,
        CreateUserResponse user,
        byte[]? tag
    ) =>
        client.PutAsJsonAsync(
            "/user",
            new PutUserDataRequest(
                user.Id,
                user.Password,
                null,
                null,
                null,
                Enumerable.Repeat((byte)0x04, 16).ToArray(),
                Enumerable.Repeat((byte)0x05, 16).ToArray(),
                tag
            )
        );
}
