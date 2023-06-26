using System.IO.Compression;
using FluentValidation;
using LiftLog.Lib.Models;

namespace LiftLog.Backend.Functions.Validators;
public class GenerateAiWorkoutPlanRequestAttributesValidator : AbstractValidator<AiWorkoutAttributes>
{
    public GenerateAiWorkoutPlanRequestAttributesValidator()
    {
        RuleFor(x => x.Age).NotNull().GreaterThan(11).LessThan(150);
        RuleFor(x => x.DaysPerWeek).NotNull().GreaterThan(0).LessThan(8);
        RuleFor(x => x.Experience).NotNull().IsInEnum();
        RuleFor(x => x.Gender).NotNull().IsInEnum();

        RuleFor(x => x.Goals.Count).ExclusiveBetween(0, 10).When(x => x.Goals != null);
        RuleFor(x => x.Goals).NotNull().ForEach(goal => goal.Length(3, 30));
        RuleFor(x => x.WeightRange).NotEmpty().Matches(@"\d{1,3}-\d{1,3}");
    }
}
