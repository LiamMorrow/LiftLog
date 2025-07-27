using System.Text.Json;
using Srcmkr.RevenueCat;

namespace LiftLog.Api.Service;

public class RevenueCatPurchaseVerificationService(
    RevenueCatClient client,
    ILogger<RevenueCatPurchaseVerificationService> logger
)
{
    public async Task<bool> GetUserIdHasProEntitlementAsync(string userId)
    {
        var subscriber = await client.GetSubscriber(userId);
        var entitlement = subscriber.Entitlements.GetValueOrDefault("pro");
        logger.LogInformation(
            "RevCat {user} {entitlement}",
            JsonSerializer.Serialize(subscriber),
            entitlement
        );
        return entitlement is not null;
    }
}
