using LiftLog.Lib;
using LiftLog.Lib.Models;
using LiftLog.Ui.Services;

namespace LiftLog.Ui.Store.Exercises;

public record SetDescribedExercisesAction(ImmutableListValue<DescribedExercise> DescribedExercises);

public record FetchDescribedExercisesAction();
