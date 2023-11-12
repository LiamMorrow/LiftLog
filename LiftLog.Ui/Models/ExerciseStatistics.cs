using LiftLog.Lib;
using LiftLog.Lib.Models;

namespace LiftLog.Ui.Models;

public record ExerciseStatistics(
    string Name,
    decimal CurrentKilograms,
    decimal MaxKilograms,
    decimal OneRepMax,
    decimal TotalKilograms,
    ImmutableListValue<DatedRecordedExercise> RecordedExercises,
    bool ExpandOnClick
);

public record DatedRecordedExercise(DateOnly Date, RecordedExercise Exercise);
