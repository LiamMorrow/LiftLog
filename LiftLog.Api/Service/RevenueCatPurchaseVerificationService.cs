namespace LiftLog.Api.Service;

public class RevenueCatPurchaseVerificationService(
    RevenueCat.Client.Projects.Item.WithProject_ItemRequestBuilder client,
    string proEntitlementId
)
{
    public async Task<bool> GetUserIdHasProEntitlementAsync(string userId)
    {
        var subscriber = await client.Customers[userId].GetAsync();
        if (subscriber is null)
        {
            return false;
        }
        var proEntitlement = subscriber.ActiveEntitlements?.Items?.FirstOrDefault(x =>
            x.EntitlementId == proEntitlementId
        );
        return proEntitlement is not null;
    }
}
