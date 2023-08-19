using System.Net;
using System.Security.Cryptography.X509Certificates;
using Google;
using Google.Apis.AndroidPublisher.v3;
using Google.Apis.Auth.OAuth2;
using Microsoft.Extensions.Logging;

namespace LiftLog.Backend.Services;

public class GooglePlayPurchaseVerificationService
{

    private readonly AndroidPublisherService androidPublisherService;
    private readonly ILogger<GooglePlayPurchaseVerificationService> logger;

    public GooglePlayPurchaseVerificationService(
        AndroidPublisherService androidPublisherService,
        ILogger<GooglePlayPurchaseVerificationService> logger
        )
    {
        this.androidPublisherService = androidPublisherService;
        this.logger = logger;
    }

    public async Task<bool> IsValidPurchaseToken(string proToken)
    {
        var getRequest = androidPublisherService.Purchases.Products
            .Get("com.limajuice.liftlog", "pro", proToken);
        try
        {
            var purchaseResult = await getRequest.ExecuteAsync();
            return purchaseResult.PurchaseState == Purchased;
        }
        catch (GoogleApiException e)
        {
            if (e.HttpStatusCode is HttpStatusCode.NotFound or HttpStatusCode.BadRequest)
            {
                logger.LogWarning(e, "Google API returned {HttpStatusCode} for proToken {ProToken}", e.HttpStatusCode, proToken, e);
                return false;
            }
            throw;
        }

    }

    const int Purchased = 0;
}
