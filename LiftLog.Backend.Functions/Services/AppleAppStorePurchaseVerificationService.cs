using System.Net.Http.Json;
using System.Text.Json.Serialization;
using LiftLog.Backend.Functions.Validators;
using Microsoft.Extensions.Logging;

namespace LiftLog.Backend.Functions.Services;

public class AppleAppStorePurchaseVerificationService(
    HttpClient httpClient,
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

        var validator = new AppleAppStorePurchaseReceiptValidator();
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

    public record AppStoreReceipt(
        [property: JsonPropertyName("quantity")] string Quantity,
        [property: JsonPropertyName("product_id")] string ProductId,
        [property: JsonPropertyName("in_app_ownership_type")] string InAppOwnershipType,
        [property: JsonPropertyName("bid")] string BundleId
    );
}
