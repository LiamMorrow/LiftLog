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
        RuleFor(x => x.EncryptedPayload).NotNull();
        RuleFor(x => x.EncryptedPayload.EncryptedPayload.Length).InclusiveBetween(0, 20 * KB);
        RuleFor(x => x.EncryptedPayload.IV).NotEmpty();
        RuleFor(x => x.EncryptedPayload.IV.Value.Length).Equal(16);
        RuleFor(x => x.Expiry).NotEmpty();
    }
}
