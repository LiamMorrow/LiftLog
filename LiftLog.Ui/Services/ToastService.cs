using LiftLog.Ui.Services;
using Microsoft.JSInterop;

namespace LiftLog.Ui.Services;

public class ToastService(IJSRuntime jSRuntime)
{
    public async void ShowToast(string message)
    {
        try
        {
            await jSRuntime.InvokeVoidAsync("AppUtils.showToast", message);
        }
        catch
        {
            // ignored
        }
    }
}
