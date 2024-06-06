using LiftLog.Ui.Services;
using Microsoft.JSInterop;

namespace LiftLog.Web;

public class JsHapticFeedbackService(IJSRuntime jsRuntime) : IHapticFeedbackService
{
    public async Task PerformAsync(HapticFeedbackType _)
    {
        await jsRuntime.InvokeVoidAsync("AppUtils.vibrate", 200);
    }
}
