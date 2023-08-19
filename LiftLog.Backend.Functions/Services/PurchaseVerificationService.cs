using Google.Apis.AndroidPublisher.v3;
using LiftLog.Backend.Services;
using LiftLog.Lib.Models;

namespace LiftLog.Backend.Functions.Services;

public class PurchaseVerificationService
{
    private readonly GooglePlayPurchaseVerificationService googlePlayPurchaseVerificationService;
    private readonly WebAuthPurchaseVerificationService webAuthPurchaseVerificationService;

    public PurchaseVerificationService(
        GooglePlayPurchaseVerificationService googlePlayPurchaseVerificationService,
        WebAuthPurchaseVerificationService webAuthPurchaseVerificationService)
    {
        this.googlePlayPurchaseVerificationService = googlePlayPurchaseVerificationService;
        this.webAuthPurchaseVerificationService = webAuthPurchaseVerificationService;
    }

    public Task<bool> IsValidPurchaseToken(AppStore appStore, string proToken)
    {
        return appStore switch
        {
            AppStore.Google => googlePlayPurchaseVerificationService.IsValidPurchaseToken(proToken),
            AppStore.Apple => throw new NotImplementedException(),
            AppStore.Web => webAuthPurchaseVerificationService.IsValidPurchaseToken(proToken),
            _ => throw new NotSupportedException(),
        };
    }

}
