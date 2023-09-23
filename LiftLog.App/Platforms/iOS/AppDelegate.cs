using Foundation;
using LiftLog.App.Services;
using UIKit;

namespace LiftLog.App;

[Register("AppDelegate")]
public class AppDelegate : MauiUIApplicationDelegate
{
    protected override MauiApp CreateMauiApp() => MauiProgram.CreateMauiApp();
}
