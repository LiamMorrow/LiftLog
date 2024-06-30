using System.Data;
using FluentValidation;
using LiftLog.Lib.Models;

namespace LiftLog.Api.Validators;

public class CreateSharedItemRequestValidator : AbstractValidator<CreateSharedItemRequest>
{
    const int KB = 1024;

    public CreateSharedItemRequestValidator()
    {
        RuleFor(x => x.UserId).NotEmpty();
        RuleFor(x => x.Password).NotEmpty().MaximumLength(40);
        RuleFor(x => x.EncryptedPayload).NotEmpty();
        RuleFor(x => x.EncryptedPayload.Length).InclusiveBetween(0, 5 * KB);
        RuleFor(x => x.EncryptionIV).NotEmpty();
        RuleFor(x => x.EncryptionIV.Length).Equal(16);
        RuleFor(x => x.Expiry).NotEmpty();
    }
}
