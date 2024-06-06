namespace LiftLog.Ui.Services;

public enum VibrationAmount{
    Short = 30,
    Medium = 150,
    Long = 500
}

public interface IVibrationService
{
    ///
    /// Vibrates the device the specified amount, the task does not wait for vibration to finish
    ///
    Task VibrateAsync(VibrationAmount amount);
}
