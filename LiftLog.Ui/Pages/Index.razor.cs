using Fluxor;
using Fluxor.Blazor.Web.Components;
using LiftLog.Lib.Models;
using LiftLog.Ui.Services;
using LiftLog.Ui.Store.App;
using LiftLog.Ui.Store.CurrentSession;
using Microsoft.AspNetCore.Components;

namespace LiftLog.Ui.Pages
{
    public partial class Index : FluxorComponent
    {
        [Inject]
        public IDispatcher Dispatcher { get; set; } = null!;

        [Inject]
        public NavigationManager NavigationManager { get; set; } = null!;

        [Inject]
        public SessionService SessionService { get; set; } = null!;

        private IReadOnlyList<Session> _upcomingSessions = new List<Session>();

        protected override async Task OnInitializedAsync()
        {
            Dispatcher.Dispatch(new SetPageTitleAction("Upcoming Workouts"));
            this._upcomingSessions = await SessionService
                .GetUpcomingSessionsAsync()
                .Take(3)
                .ToListAsync();
            await base.OnInitializedAsync();
        }

        private void SelectSession(Session session)
        {
            Dispatcher.Dispatch(new SetCurrentSessionAction(session));
            NavigationManager.NavigateTo("/session");
        }
    }
}