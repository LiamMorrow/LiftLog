using Fluxor;
using LiftLog.Ui.Services;
using LiftLog.Ui.Store.App;
using LiftLog.Ui.Store.Program;
using LiftLog.Ui.Store.Settings;
using MaterialColorUtilities.Maui;
using Microsoft.AspNetCore.Components;

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

        window.Activated += (sender, args) =>
        {
            IMaterialColorService.Current.Initialize(Resources);
            LiftLog.App.MainPage.BlazorWebView?.TryDispatchAsync(svc =>
            {
                Console.WriteLine(
                    "FROMBLAZOR: "
                        + svc.GetRequiredService<IState<ProgramState>>().Value.ActivePlanId
                );
            });
        };

        return window;
    }
}
