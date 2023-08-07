namespace LiftLog.Ui.Services;

public interface IUserScrollListener
{
    ValueTask ScrollHasChangedAsync(bool hasScrolled);
}
