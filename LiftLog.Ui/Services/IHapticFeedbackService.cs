namespace LiftLog.Ui.Services;

public enum HapticFeedbackType
{
    Click,
    LongPress,
}

public interface IHapticFeedbackService
{
    ///
    /// Given a type of haptic feedback, perform the feedback such as a vibration or a sound
    ///
    Task PerformAsync(HapticFeedbackType type);
}
