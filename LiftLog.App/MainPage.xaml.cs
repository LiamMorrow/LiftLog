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

    private static string? toNavigate;

    /// <summary>
    /// Used to navigate to a specific absolute path when the webview is loaded.
    /// Currently used to handle intents which open the app from a url
    /// </summary>
    /// <param name="url"></param>
    public static async void NavigateWhenLoaded(string url)
    {
        if (BlazorWebView is null)
        {
            toNavigate = url;
            return;
        }

        var couldNavigate = await BlazorWebView.TryDispatchAsync(
            svc => svc.GetRequiredService<NavigationManager>().NavigateTo(url)
        );

        if (!couldNavigate)
        {
            // Lord forgive me - there doesn't seem to be a loaded event which will guarantee that the webview is ready to navigate
            await Task.Delay(100);
            NavigateWhenLoaded(url);
            return;
        }
        toNavigate = null;
    }

    private void MainPage_Loaded(object? sender, EventArgs e)
    {
        BlazorWebView = blazorWebView;
        if (toNavigate is not null)
        {
            NavigateWhenLoaded(toNavigate);
        }
#if DEBUG
#if IOS
        if (blazorWebView.Handler.PlatformView is WebKit.WKWebView view)
        {
            view.SetValueForKey(
                Foundation.NSObject.FromObject(true),
                new Foundation.NSString("inspectable")
            );
        }
#endif
#endif
    }
}
