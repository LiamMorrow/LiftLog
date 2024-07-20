using LiftLog.Ui.Services;
using Microsoft.JSInterop;

namespace LiftLog.Ui.Services;

public class ToastService(IJSRuntime jSRuntime)
{
    public async void ShowToast(string message)
    {
        try
        {
            await jSRuntime.InvokeVoidAsync("WebUtils.showToast", message);
        }
        catch
        {
            // ignored
        }
    }
}
