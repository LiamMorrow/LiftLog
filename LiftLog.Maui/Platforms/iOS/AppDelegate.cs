using Foundation;
using LiftLog.Maui.Services;
using UIKit;

namespace LiftLog.Maui;

[Register("AppDelegate")]
public class AppDelegate : MauiUIApplicationDelegate
{
    protected override MauiApp CreateMauiApp() => MauiProgram.CreateMauiApp();
}
