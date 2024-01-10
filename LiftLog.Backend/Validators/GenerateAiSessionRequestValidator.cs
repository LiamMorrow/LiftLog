using FluentValidation;
using LiftLog.Lib.Models;

namespace LiftLog.Backend.Validators;

public class GenerateAiSessionRequestValidator : AbstractValidator<GenerateAiSessionRequest>
{
    public GenerateAiSessionRequestValidator()
    {
        RuleFor(x => x.Attributes).NotNull();
        RuleFor(x => x.Attributes).SetValidator(new GenerateAiSessionRequestAttributesValidator());
    }
}
