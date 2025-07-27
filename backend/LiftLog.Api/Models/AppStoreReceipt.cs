using System.Text.Json.Serialization;

namespace LiftLog.Api.Models;

public record AppStoreReceipt(
    [property: JsonPropertyName("quantity")] string Quantity,
    [property: JsonPropertyName("product_id")] string ProductId,
    [property: JsonPropertyName("in_app_ownership_type")] string InAppOwnershipType,
    [property: JsonPropertyName("bid")] string BundleId
);
