using FluentValidation;
using LiftLog.Lib.Models;

namespace LiftLog.Backend.Validators;

public class GenerateAiWorkoutRequestValidator : AbstractValidator<GenerateAiWorkoutPlanRequest>
{
    public GenerateAiWorkoutRequestValidator()
    {
        RuleFor(x => x.Attributes).NotNull();
        RuleFor(x => x.Attributes)
            .SetValidator(new GenerateAiWorkoutPlanRequestAttributesValidator());
    }
}
