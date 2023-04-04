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
using LiftLog.WebUi.Services;

namespace LiftLog.WebUi.Pages
{
    public partial class Index : FluxorComponent
    {
        [Inject]
        public IDispatcher Dispatcher { get; set; } = null!;

        [Inject]
        public NavigationManager NavigationManager { get; set; } = null!;

        [Inject]
        public SessionService SessionService { get; set; } = null!;

        private IReadOnlyList<Session> upcomingSessions = null!;

        protected override async Task OnInitializedAsync()
        {
            this.upcomingSessions = await SessionService
                .GetUpcomingSessionsAsync()
                .Take(3)
                .ToListAsync();
            await base.OnInitializedAsync();
        }

        private async void StartSession()
        {
            SelectSession(await SessionService.GetCurrentOrNextSessionAsync());
        }

        private void SelectSession(Session session)
        {
            Dispatcher.Dispatch(new SetCurrentSessionAction(session));
            NavigationManager.NavigateTo("/session");
        }
    }
}
