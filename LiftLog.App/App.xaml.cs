using MaterialColorUtilities.Maui;

namespace LiftLog.App;

public partial class App : Application
{
    public App()
    {
        InitializeComponent();
        IMaterialColorService.Current.Initialize(this.Resources);
        MainPage = new MainPage();
    }
}
