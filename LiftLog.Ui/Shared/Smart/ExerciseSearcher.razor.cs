using System.Text.RegularExpressions;

namespace LiftLog.Ui.Shared.Smart;

public partial class ExerciseSearcher
{
    private static bool IsMatch(string? exerciseName, string pattern)
    {
        if (string.IsNullOrWhiteSpace(exerciseName))
            return false;
        return Regex.IsMatch(exerciseName, pattern, RegexOptions.IgnoreCase);
    }

    private static int DistanceOfFirstCharacterFromStartOfPattern(
        string exerciseName,
        string pattern
    )
    {
        if (pattern.Length == 0)
            return int.MaxValue;
        var firstLetter = pattern[0];
        var index = exerciseName.IndexOf(firstLetter, StringComparison.CurrentCultureIgnoreCase);
        return index == -1 ? int.MaxValue : index;
    }

    private static int MostConsecutiveMatches(string exerciseName, string pattern)
    {
        if (pattern.Length == 0)
            return 0;
        var patternIndex = 0;
        var matches = 0;
        for (var i = 0; i < exerciseName.Length; i++)
        {
            if (char.ToLower(exerciseName[i]) == char.ToLower(pattern[patternIndex]))
            {
                patternIndex++;
                if (patternIndex == pattern.Length)
                    return pattern.Length;
            }
            else
            {
                patternIndex = 0;
            }
        }
        return matches;
    }
}
