using LiftLog.Lib;
using LiftLog.Lib.Models;

namespace LiftLog.Ui.Models;

public record ExerciseStatistics(
    string Name,
    decimal CurrentKilograms,
    decimal MaxKilograms,
    decimal OneRepMax,
    decimal TotalKilograms,
    ImmutableListValue<RecordedExercise> RecordedExercises,
    bool ExpandOnClick
);
