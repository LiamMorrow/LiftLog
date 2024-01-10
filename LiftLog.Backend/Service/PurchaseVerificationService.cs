using LiftLog.Lib.Models;

namespace LiftLog.Backend.Service;

public class PurchaseVerificationService(
    GooglePlayPurchaseVerificationService googlePlayPurchaseVerificationService,
    WebAuthPurchaseVerificationService webAuthPurchaseVerificationService,
    AppleAppStorePurchaseVerificationService appleAppStorePurchaseVerificationService
)
{
    public Task<bool> IsValidPurchaseToken(AppStore appStore, string proToken)
    {
        return appStore switch
        {
            AppStore.Google => googlePlayPurchaseVerificationService.IsValidPurchaseToken(proToken),
            AppStore.Apple
                => appleAppStorePurchaseVerificationService.IsValidPurchaseToken(proToken),
            AppStore.Web => webAuthPurchaseVerificationService.IsValidPurchaseToken(proToken),
            _ => throw new NotSupportedException(),
        };
    }
}
