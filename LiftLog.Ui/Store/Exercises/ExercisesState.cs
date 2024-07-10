using LiftLog.Lib;
using LiftLog.Lib.Models;
using LiftLog.Ui.Services;

namespace LiftLog.Ui.Store.Exercises;

public record ExercisesState(ImmutableListValue<DescribedExercise> DescribedExercises);
