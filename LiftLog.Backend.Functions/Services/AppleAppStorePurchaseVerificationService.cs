using System.Reflection.Emit;
using LiftLog.Lib.Models;
using Microsoft.Extensions.Logging;

namespace LiftLog.Backend.Functions.Services;

public class AppleAppStorePurchaseVerificationService
{
    private readonly ILogger<AppleAppStorePurchaseVerificationService> logger;

    public AppleAppStorePurchaseVerificationService(
        ILogger<AppleAppStorePurchaseVerificationService> logger
    )
    {
        this.logger = logger;
    }

    public Task<bool> IsValidPurchaseToken(string proToken)
    {
        logger.LogInformation("Validating purchase token {ProToken}", proToken);
        return Task.FromResult(true);
    }
}
