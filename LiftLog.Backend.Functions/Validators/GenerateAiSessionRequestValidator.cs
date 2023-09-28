using FluentValidation;
using LiftLog.Lib.Models;

namespace LiftLog.Backend.Functions.Validators;

public class GenerateAiSessionRequestValidator : AbstractValidator<GenerateAiSessionRequest>
{
    public GenerateAiSessionRequestValidator()
    {
        RuleFor(x => x.Attributes).NotNull();
        RuleFor(x => x.Attributes).SetValidator(new GenerateAiSessionRequestAttributesValidator());
    }
}
