using System.Net;
using Google;
using Google.Apis.AndroidPublisher.v3;

namespace LiftLog.Api.Service;

public class GooglePlayPurchaseVerificationService(
    AndroidPublisherService androidPublisherService,
    ILogger<GooglePlayPurchaseVerificationService> logger
)
{
    public async Task<bool> IsValidPurchaseToken(string proToken)
    {
        var getRequest = androidPublisherService.Purchases.Products.Get(
            "com.limajuice.liftlog",
            "pro",
            proToken
        );
        try
        {
            var purchaseResult = await getRequest.ExecuteAsync();
            return purchaseResult.PurchaseState == Purchased;
        }
        catch (GoogleApiException e)
        {
            if (e.HttpStatusCode is HttpStatusCode.NotFound or HttpStatusCode.BadRequest)
            {
                logger.LogWarning(
                    e,
                    "Google API returned {HttpStatusCode} for proToken {ProToken}",
                    e.HttpStatusCode,
                    proToken
                );
                return false;
            }
            throw;
        }
    }

    const int Purchased = 0;
}
