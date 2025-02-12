namespace LiftLog.Ui.Shared.Presentation;

public record WeightAndRepsChipData(int? RepsCompleted, int RepTarget, decimal Weight);

public record PotentialSetChipData(int RepTarget, int NumSets, decimal Weight);

public partial class ExerciseSummary
{
    private IEnumerable<WeightAndRepsChipData> GetWeightAndRepsChips()
    {
        var chips = Exercise.PotentialSets.Select(set => new WeightAndRepsChipData(
            set.Set?.RepsCompleted,
            Exercise.Blueprint.RepsPerSet,
            set.Weight
        ));

        return chips;
    }

    private IEnumerable<PotentialSetChipData> GetPlannedChipData()
    {
        return Exercise
            .PotentialSets.GroupBy(x => x.Weight)
            .Select(x => new PotentialSetChipData(
                Exercise.Blueprint.RepsPerSet,
                x.Count(),
                x.First().Weight
            ));
    }
}
