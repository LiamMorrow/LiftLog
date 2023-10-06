using Google.Apis.AndroidPublisher.v3;
using LiftLog.Backend.Services;
using LiftLog.Lib.Models;

namespace LiftLog.Backend.Functions.Services;

public class PurchaseVerificationService
{
    private readonly GooglePlayPurchaseVerificationService googlePlayPurchaseVerificationService;
    private readonly WebAuthPurchaseVerificationService webAuthPurchaseVerificationService;
    private readonly AppleAppStorePurchaseVerificationService appleAppStorePurchaseVerificationService;

    public PurchaseVerificationService(
        GooglePlayPurchaseVerificationService googlePlayPurchaseVerificationService,
        WebAuthPurchaseVerificationService webAuthPurchaseVerificationService,
        AppleAppStorePurchaseVerificationService appleAppStorePurchaseVerificationService
    )
    {
        this.googlePlayPurchaseVerificationService = googlePlayPurchaseVerificationService;
        this.webAuthPurchaseVerificationService = webAuthPurchaseVerificationService;
        this.appleAppStorePurchaseVerificationService = appleAppStorePurchaseVerificationService;
    }

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
