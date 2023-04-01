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

        private void SelectSession(Session session)
        {
            Dispatcher.Dispatch(new SetCurrentSessionAction(session));
            NavigationManager.NavigateTo("/session");
        }
    }
}
