using LiftLog.Ui.Services;
using Microsoft.JSInterop;

namespace LiftLog.Web;

public class JsVibrationService(IJSRuntime jsRuntime) : IVibrationService
{

    public async Task VibrateAsync(VibrationAmount amount)
    {
        await jsRuntime.InvokeVoidAsync("AppUtils.vibrate", amount);
    }
}
