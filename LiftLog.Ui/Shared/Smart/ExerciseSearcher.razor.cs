using System.Text.RegularExpressions;
using FuzzySharp;
using FuzzySharp.SimilarityRatio;
using FuzzySharp.SimilarityRatio.Scorer.Composite;

namespace LiftLog.Ui.Shared.Smart;

public partial class ExerciseSearcher
{
    private static List<string> GetTopMatches(string searchTerm, IEnumerable<string> exerciseNames)
    {
        return Process
            .ExtractTop(
                searchTerm,
                exerciseNames,
                scorer: ScorerCache.Get<WeightedRatioScorer>(),
                cutoff: 30
            )
            .OrderByDescending(x => x.Score)
            .ThenByDescending(x => Fuzz.Ratio(x.Value, searchTerm))
            .Select(x => x.Value)
            .ToList();
    }
}
