using LiftLog.Ui.Services;
using Microsoft.JSInterop;

namespace LiftLog.Web.Services;

public class ClipboardStringSharer : IStringSharer
{
    private readonly IJSRuntime _jsRuntime;

    public ClipboardStringSharer(IJSRuntime jsRuntime)
    {
        _jsRuntime = jsRuntime;
    }

    public async Task ShareAsync(string text)
    {
        await _jsRuntime.InvokeVoidAsync("navigator.clipboard.writeText", text);
        await _jsRuntime.InvokeVoidAsync("alert", "Copied to clipboard!");
    }
}
