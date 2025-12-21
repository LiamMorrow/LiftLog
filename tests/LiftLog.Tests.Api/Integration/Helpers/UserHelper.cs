using LiftLog.Lib.Models;

namespace LiftLog.Tests.Api.Integration.Helpers;

public static class UserHelper
{
    public static async Task<CreateUserResponse> CreateUserAsync(
        HttpClient client,
        byte[] encryptionIV,
        byte[] rsaPublicKey
    )
    {
        var userCreateRequest = new CreateUserRequest();
        var createUserResponse = await (
            await client.PostAsJsonAsync("/user/create", userCreateRequest)
        ).Content.ReadFromJsonAsync<CreateUserResponse>()!;

        var putUserDataRequest = new PutUserDataRequest(
            createUserResponse!.Id,
            createUserResponse.Password,
            null,
            null,
            null,
            encryptionIV,
            rsaPublicKey
        );

        (await client.PutAsJsonAsync("/user", putUserDataRequest)).EnsureSuccessStatusCode();

        return createUserResponse;
    }
}
