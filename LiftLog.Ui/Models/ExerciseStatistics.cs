using LiftLog.Lib;
using LiftLog.Lib.Models;

namespace LiftLog.Ui.Models;

public record ExerciseStatistics(
    string Name,
    decimal CurrentWeight,
    decimal MaxWeight,
    decimal OneRepMax,
    decimal TotalWeight,
    ImmutableListValue<DatedRecordedExercise> RecordedExercises,
    bool ExpandOnClick
);

public record DatedRecordedExercise(DateOnly Date, RecordedExercise Exercise);
