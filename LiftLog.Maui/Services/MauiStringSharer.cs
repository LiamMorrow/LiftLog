using System.IO.Compression;
using LiftLog.Ui.Services;

namespace LiftLog.Maui.Services;

public class MauiStringSharer(IShare share) : IStringSharer
{
    public async Task ShareAsync(string value)
    {
        await share.RequestAsync(
            new ShareTextRequest { Uri = value, Title = "Share your workouts" }
        );
    }
}
