namespace LiftLog.Ui.Shared.Presentation;

public partial class LimitedHtml
{
    private IEnumerable<(bool IsHighlighted, string Text, bool HasBreakBefore)> ParseLimitedHtml()
    {
        var currentIndex = 0;
        var closed = true;
        const string HIGHLIGHT_TAG = "<em>";
        const string HIGHLIGHT_TAG_CLOSING = "</em>";

        while (currentIndex < Value.Length)
        {
            var findTag = closed ? HIGHLIGHT_TAG : HIGHLIGHT_TAG_CLOSING;
            var index = Value.IndexOf(findTag, currentIndex);

            if (index == -1)
            {
                var remainingText = Value.Substring(currentIndex);
                if (!closed)
                {
                    remainingText = HIGHLIGHT_TAG + remainingText;
                }
                // split on br and return each part
                // if the index is odd, it means the previous part had a <br> tag so it should be inserted
                var parts = remainingText.Split("<br>");
                for (var i = 0; i < parts.Length; i++)
                {
                    yield return (!closed, parts[i], i % 2 == 1);
                }
                break;
            }

            closed = !closed;
            var innerText = Value.Substring(currentIndex, index - currentIndex);
            if (!string.IsNullOrEmpty(innerText))
            {
                // split on br and return each part
                // if the index is odd, it means the previous part had a <br> tag so it should be inserted
                var parts = innerText.Split("<br>");
                for (var i = 0; i < parts.Length; i++)
                {
                    yield return (closed, parts[i], i % 2 == 1);
                }
            }

            currentIndex = index + findTag.Length;
        }
    }
}
