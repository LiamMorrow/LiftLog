using LiftLog.Ui.Services;

namespace LiftLog.App.Services;

public class MauiShareTextExporter:ITextExporter
{
    private readonly IShare _share;

    public MauiShareTextExporter(IShare share)
    {
        _share = share;
    }
    public Task ExportTextAsync(string text)
    {
        return _share.RequestAsync(new ShareTextRequest
        {
            Title = "Export Data",
            Text = text
        });
    }
}