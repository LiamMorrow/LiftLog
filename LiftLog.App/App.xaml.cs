using MaterialColorUtilities.Maui;

namespace LiftLog.App;

public partial class App : Application
{
    public App()
    {
        InitializeComponent();
        MainPage = new MainPage();
    }

    protected override Window CreateWindow(IActivationState? activationState)
    {
        Window window = base.CreateWindow(activationState);

        window.Created += (s, e) =>
        {
            IMaterialColorService.Current.Initialize(Resources);
        };

        window.Resumed += (sender, args) =>
        {
            IMaterialColorService.Current.Initialize(Resources);
        };

        return window;
    }
}
