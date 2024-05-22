using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.WebView.Maui;

namespace LiftLog.App;

public partial class MainPage : ContentPage
{
    public MainPage()
    {
        InitializeComponent();
        Loaded += MainPage_Loaded;
    }

    private static BlazorWebView? BlazorWebView { get; set; }

    private void MainPage_Loaded(object? sender, EventArgs e)
    {
#if DEBUG
#if IOS
        if (blazorWebView.Handler.PlatformView is WebKit.WKWebView view)
        {
            if (
                OperatingSystem.IsIOSVersionAtLeast(16, 4)
                || OperatingSystem.IsMacCatalystVersionAtLeast(13, 3)
            )
            {
                view.SetValueForKey(
                    Foundation.NSObject.FromObject(true),
                    new Foundation.NSString("inspectable")
                );
            }
        }
#endif
#endif
    }
}
