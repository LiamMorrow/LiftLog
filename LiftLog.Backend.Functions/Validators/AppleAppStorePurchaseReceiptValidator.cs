using FluentValidation;
using LiftLog.Backend.Services;
using static LiftLog.Backend.Functions.Services.AppleAppStorePurchaseVerificationService;

namespace LiftLog.Backend.Functions.Validators;

public class AppleAppStorePurchaseReceiptValidator : AbstractValidator<AppStoreReceipt>
{
    public AppleAppStorePurchaseReceiptValidator()
    {
        RuleFor(x => x.InAppOwnershipType).Equal("PURCHASED");
        RuleFor(x => x.ProductId).Equal("pro");
        RuleFor(x => x.BundleId).Equal("com.limajuice.liftlog");
        RuleFor(x => x.Quantity)
            .Must(x => int.TryParse(x, out var quantity) && quantity >= 1)
            .WithMessage("Quantity must be larger than 0");
    }
}
