using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Fluxor;
using Fluxor.Blazor.Web.Components;
using Microsoft.AspNetCore.Components;
using LiftLog.Lib;
using LiftLog.Lib.Models;
using LiftLog.Lib.Store;
using LiftLog.WebUi.Store.CurrentSession;
using System.Runtime.InteropServices;
using System.Collections.Immutable;

namespace LiftLog.WebUi.Pages
{
    public partial class Index : FluxorComponent
    {
        [Inject]
        public IDispatcher Dispatcher { get; set; } = null!;

        [Inject]
        public NavigationManager NavigationManager { get; set; } = null!;

        protected override async Task OnInitializedAsync()
        {
            await base.OnInitializedAsync();
        }

        private void StartSession()
        {
            var bench = new ExerciseBlueprint(
                "Bench Press",
                5,
                5,
                20,
                2.5m,
                new Rest(TimeSpan.FromSeconds(90), TimeSpan.FromMinutes(3), TimeSpan.FromMinutes(5))
            );
            SelectSession(
                new Session(
                    Guid.NewGuid(),
                    new SessionBlueprint("Test", ImmutableList.Create(bench)),
                    ImmutableList.Create(
                        new RecordedExercise(
                            bench,
                            20m,
                            ImmutableList.Create<RecordedSet?>(null, null, null, null, null),
                            false
                        )
                    ),
                    DateTime.Now
                )
            );
        }

        private void SelectSession(Session session)
        {
            Dispatcher.Dispatch(new SetCurrentSessionAction(session));
            NavigationManager.NavigateTo("/session");
        }
    }
}
