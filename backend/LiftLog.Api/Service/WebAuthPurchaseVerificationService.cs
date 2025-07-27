namespace LiftLog.Api.Service;

public class WebAuthPurchaseVerificationService(string? webAuthKey)
{
    public Task<bool> IsValidPurchaseToken(string proToken)
    {
        // Deny all requests if the web auth key is not set
        if (string.IsNullOrWhiteSpace(webAuthKey))
        {
            return Task.FromResult(false);
        }

        return Task.FromResult(proToken == webAuthKey);
    }
}
