using LiftLog.Lib.Models;

namespace LiftLog.Api.Service;

public class PurchaseVerificationService(
    IServiceProvider services,
    ILogger<PurchaseVerificationService> logger
)
{
    public async Task<bool> IsValidPurchaseToken(AppStore appStore, string proToken)
    {
        try
        {
            return await (
                appStore switch
                {
                    AppStore.Web => services
                        .GetRequiredService<WebAuthPurchaseVerificationService>()
                        .IsValidPurchaseToken(proToken),
                    AppStore.RevenueCat => services
                        .GetRequiredService<IRevenueCatPurchaseVerificationService>()
                        .GetUserIdHasProEntitlementAsync(proToken),
                }
            );
        }
        catch (Exception e)
        {
            logger.LogError(e, "Failed to verify purchase");
            return false;
        }
    }
}
