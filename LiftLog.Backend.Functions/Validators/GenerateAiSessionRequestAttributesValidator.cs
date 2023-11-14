using System.IO.Compression;
using FluentValidation;
using LiftLog.Lib.Models;

namespace LiftLog.Backend.Functions.Validators;

public class GenerateAiSessionRequestAttributesValidator : AbstractValidator<AiSessionAttributes>
{
    public GenerateAiSessionRequestAttributesValidator()
    {
        RuleFor(x => x.Volume).NotNull().GreaterThan(-1).LessThan(101);

        RuleFor(x => x.AreasToWorkout.Count)
            .ExclusiveBetween(0, 10)
            .When(x => x.AreasToWorkout != null);
        RuleFor(x => x.AreasToWorkout).NotNull().ForEach(goal => goal.Length(3, 15));

        RuleFor(x => x.ExerciseToWeight.Count)
            .InclusiveBetween(0, 100)
            .When(x => x.ExerciseToWeight != null);
        RuleFor(x => x.ExerciseToWeight)
            .NotNull()
            .ForEach(
                ex =>
                    ex.Must(pc => pc.Key.Length > -1 && pc.Key.Length < 50)
                        .WithMessage("Exercise name must be between 0 and 50 characters long.")
            );
    }
}
