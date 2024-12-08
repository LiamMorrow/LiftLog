using System.Globalization;
using Foundation;
using LiftLog.Maui.Services;
using UIKit;

namespace LiftLog.Maui;

[Register("AppDelegate")]
public class AppDelegate : MauiUIApplicationDelegate
{
    protected override MauiApp CreateMauiApp()
    {
        var app = MauiProgram.CreateMauiApp();
        var newCulture = CultureInfo.CurrentCulture.Clone() as CultureInfo;
        newCulture!.NumberFormat.NumberDecimalSeparator = NSLocale.CurrentLocale.DecimalSeparator;
        newCulture.NumberFormat.CurrencyGroupSeparator = NSLocale.CurrentLocale.GroupingSeparator;

        CultureInfo.CurrentCulture = newCulture;
        CultureInfo.CurrentUICulture = newCulture;
        return app;
    }
}
