namespace LiftLog.App;

public partial class MainPage : ContentPage
{
    public MainPage()
    {
        InitializeComponent();
        Loaded += MainPage_Loaded;
    }

    private void MainPage_Loaded(object? sender, EventArgs e)
    {
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
