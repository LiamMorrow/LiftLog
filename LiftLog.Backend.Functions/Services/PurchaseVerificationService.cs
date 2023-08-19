using Google.Apis.AndroidPublisher.v3;
using LiftLog.Backend.Services;
using LiftLog.Lib.Models;

namespace LiftLog.Backend.Functions.Services;

public class PurchaseVerificationService
{
    private readonly GooglePlayPurchaseVerificationService googlePlayPurchaseVerificationService;

    public PurchaseVerificationService(GooglePlayPurchaseVerificationService googlePlayPurchaseVerificationService)
    {
        this.googlePlayPurchaseVerificationService = googlePlayPurchaseVerificationService;
    }

    public Task<bool> IsValidPurchaseToken(AppStore appStore, string proToken)
    {
        return appStore switch
        {
            AppStore.Google => googlePlayPurchaseVerificationService.IsValidPurchaseToken(proToken),
            AppStore.Apple => throw new NotImplementedException(),
            AppStore.Web => throw new NotSupportedException(),
            _ => throw new NotSupportedException(),
        };
    }

}
