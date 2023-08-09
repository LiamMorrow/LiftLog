using LiftLog.Ui.Services;

namespace LiftLog.Web.Services;

public class DummyUserScrollListener : IUserScrollListener
{
    public ValueTask ScrollHasChangedAsync(bool hasScrolled)
    {
        return ValueTask.CompletedTask;
    }
}
