using LiftLog.Ui.Services;
using HapticFeedbackType = Microsoft.Maui.Devices.HapticFeedbackType;

namespace LiftLog.Maui.Services;

public class AppHapticFeedbackService(IHapticFeedback hapticFeedback) : IHapticFeedbackService
{
    public Task PerformAsync(Ui.Services.HapticFeedbackType amount)
    {
        var mapped = amount switch
        {
            Ui.Services.HapticFeedbackType.Click => HapticFeedbackType.Click,
            Ui.Services.HapticFeedbackType.LongPress => HapticFeedbackType.LongPress,
            _ => throw new ArgumentOutOfRangeException(nameof(amount), amount, null),
        };
        hapticFeedback.Perform(mapped);
        return Task.CompletedTask;
    }
}
