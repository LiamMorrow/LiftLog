using LiftLog.Lib.Models;

namespace LiftLog.Api.Service;

public class PurchaseVerificationService(IServiceProvider services)
{
    public Task<bool> IsValidPurchaseToken(AppStore appStore, string proToken)
    {
        return appStore switch
        {
            AppStore.Google => services
                .GetRequiredService<GooglePlayPurchaseVerificationService>()
                .IsValidPurchaseToken(proToken),
            AppStore.Apple => services
                .GetRequiredService<AppleAppStorePurchaseVerificationService>()
                .IsValidPurchaseToken(proToken),
            AppStore.Web => services
                .GetRequiredService<WebAuthPurchaseVerificationService>()
                .IsValidPurchaseToken(proToken),
            AppStore.RevenueCat => services
                .GetRequiredService<RevenueCatPurchaseVerificationService>()
                .GetUserIdHasProEntitlementAsync(proToken),
        };
    }
}
