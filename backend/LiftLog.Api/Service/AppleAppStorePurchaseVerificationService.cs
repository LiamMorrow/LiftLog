using System.Text.Json.Serialization;
using FluentValidation;
using LiftLog.Api.Models;
using static LiftLog.Api.Service.AppleAppStorePurchaseVerificationService;

namespace LiftLog.Api.Service;

public class AppleAppStorePurchaseVerificationService(
    HttpClient httpClient,
    IValidator<AppStoreReceipt> validator,
    ILogger<AppleAppStorePurchaseVerificationService> logger
)
{
    const string AppleAppStoreSandboxUrl = "https://sandbox.itunes.apple.com/verifyReceipt";
    const string AppleAppStoreProductionUrl = "https://buy.itunes.apple.com/verifyReceipt";

    public async Task<bool> IsValidPurchaseToken(string proToken)
    {
        var deserializedToken = await ValidateAndDecodeToken(AppleAppStoreProductionUrl, proToken);
        if (deserializedToken == null)
        {
            deserializedToken = await ValidateAndDecodeToken(AppleAppStoreSandboxUrl, proToken);
            if (deserializedToken == null)
            {
                return false;
            }
        }

        var validationResult = await validator.ValidateAsync(deserializedToken);
        if (!validationResult.IsValid)
        {
            logger.LogWarning(
                "Failed to validate a purchaseToken: {errors}",
                validationResult.Errors
            );
            return false;
        }

        return true;
    }

    private async Task<AppStoreReceipt?> ValidateAndDecodeToken(
        string validationUrl,
        string proToken
    )
    {
        var response = await httpClient.PostAsJsonAsync(
            validationUrl,
            new AppStoreValidateRequest(proToken)
        );

        if (!response.IsSuccessStatusCode)
        {
            return null;
        }

        var receiptResponse = await response.Content.ReadFromJsonAsync<AppStoreReceiptResponse>();
        if (receiptResponse == null)
        {
            return null;
        }

        return receiptResponse.Receipt;
    }

    private record AppStoreValidateRequest(
        [property: JsonPropertyName("receipt-data")] string ReceiptData
    )
    {
        [JsonPropertyName("exclude-old-transactions")]
        public bool ExcludeOldTransactions { get; } = false;
    }

    private record AppStoreReceiptResponse(
        [property: JsonPropertyName("status")] int Status,
        [property: JsonPropertyName("receipt")] AppStoreReceipt Receipt
    );
}
