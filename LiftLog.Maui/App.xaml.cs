﻿using System.Text.RegularExpressions;
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

namespace LiftLog.Maui;

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
        IMaterialColorService.Current.Initialize(Resources);
    }

    protected override Window CreateWindow(IActivationState? activationState)
    {
        Window window = base.CreateWindow(activationState);

        window.Activated += (sender, args) =>
        {
            var session = currentSessionState.Value.WorkoutSession;
            // Complete a finished session if it has been more than half an hour since the last set
            // And there are no more sets to complete
            // OR
            // It has been more than 12 hours since the last set
            if (session?.LastExercise?.LastRecordedSet?.Set is not null)
            {
                var lastSet = session.LastExercise.LastRecordedSet.Set;
                var lastSetTime = session.Date.ToDateTime(
                    lastSet.CompletionTime,
                    DateTimeKind.Local
                );
                var timeSinceLastSet = DateTime.Now - lastSetTime;
                if (
                    (timeSinceLastSet > TimeSpan.FromMinutes(30) && session.IsComplete)
                    || (timeSinceLastSet > TimeSpan.FromHours(12))
                )
                {
                    dispatcher.Dispatch(
                        new PersistCurrentSessionAction(SessionTarget.WorkoutSession)
                    );
                    dispatcher.Dispatch(new AddUnpublishedSessionIdAction(session.Id));
                    dispatcher.Dispatch(
                        new SetCurrentSessionAction(SessionTarget.WorkoutSession, null)
                    );
                    dispatcher.Dispatch(
                        new NavigateAction("/", IfCurrentPathMatches: SessionPathRegex())
                    );
                }
            }
        };

        return window;
    }

    [GeneratedRegex(".*/session")]
    private static partial Regex SessionPathRegex();
}
