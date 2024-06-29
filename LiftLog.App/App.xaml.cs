using System.Text.RegularExpressions;
using Fluxor;
using LiftLog.Lib.Models;
using LiftLog.Ui.Services;
using LiftLog.Ui.Store.App;
using LiftLog.Ui.Store.CurrentSession;
using LiftLog.Ui.Store.Feed;
using LiftLog.Ui.Store.Program;
using LiftLog.Ui.Store.Settings;
using MaterialColorUtilities.Maui;
using Microsoft.AspNetCore.Components;

namespace LiftLog.App;

public partial class App : Application
{
    private readonly Fluxor.IDispatcher dispatcher;
    private readonly IState<CurrentSessionState> currentSessionState;

    public App(Fluxor.IDispatcher dispatcher, IState<CurrentSessionState> currentSessionState)
    {
        InitializeComponent();
        MainPage = new MainPage();
        this.dispatcher = dispatcher;
        this.currentSessionState = currentSessionState;
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

    [GeneratedRegex(".*/session")]
    private static partial Regex SessionPathRegex();
}
