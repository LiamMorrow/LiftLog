#if DEBUG
using LiftLog.Lib.Models;
using LiftLog.Ui.Store.App;
using LiftLog.Ui.Store.CurrentSession;

namespace LiftLog.Ui.Pages.Screenshot;

public partial class ScreenshotCollectorPage
{
    private async Task HandleAiPageScreenshotCollection()
    {
        Dispatcher.Dispatch(new NavigateAction("/settings/ai-planner"));
        await Task.Yield();
    }

    private async Task HandleAiSessionScreenshotCollection()
    {
        Dispatcher.Dispatch(new NavigateAction("/settings/ai-session-creator"));
        await Task.Yield();
    }
}
#endif
