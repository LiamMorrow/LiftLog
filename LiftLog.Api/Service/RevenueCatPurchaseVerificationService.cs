namespace LiftLog.Api.Service;

public class RevenueCatPurchaseVerificationService(
    RevenueCat.Client.Projects.Item.WithProject_ItemRequestBuilder client,
    string proEntitlementId,
    ILogger<RevenueCatPurchaseVerificationService> logger
)
{
    public async Task<bool> GetUserIdHasProEntitlementAsync(string userId)
    {
        logger.LogInformation("User {user}", userId);
        var res = await new HttpClient().GetAsync("https://google.com");
        logger.LogInformation("Got res {res}", await res.Content.ReadAsStringAsync());
        var subscriber = await client.Customers[userId].GetAsync();
        logger.LogInformation("Got subscriber");
        if (subscriber is null)
        {
            return false;
        }
        logger.LogInformation("Getting pro entitlement");
        var proEntitlement = subscriber.ActiveEntitlements?.Items?.FirstOrDefault(x =>
            x.EntitlementId == proEntitlementId
        );
        logger.LogInformation("Got pro entitlement {e}", proEntitlement);
        return proEntitlement is not null;
    }
}
