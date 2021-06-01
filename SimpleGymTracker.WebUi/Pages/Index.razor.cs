using System;
using Fluxor;
using Microsoft.AspNetCore.Components;
using SimpleGymTracker.Lib.Models;
using SimpleGymTracker.WebUi.Store.WorkoutSession;
using SimpleGymTracker.WebUi.Store.WorkoutSettings;

namespace SimpleGymTracker.WebUi.Pages
{
  public partial class Index
  {
    [Inject]
    private IState<WorkoutSettingsState> WorkoutSettingsState { get; set; } = null!;

    [Inject]
    public IDispatcher Dispatcher { get; set; } = null!;

    [Inject]
    public NavigationManager NavigationManager { get; set; } = null!;

    private void SelectWorkoutPlan(WorkoutPlan plan)
    {
      Dispatcher.Dispatch(new SelectPlanAction(plan));
      Dispatcher.Dispatch(new SetWorkoutDayAction(new WorkoutDayDao(Guid.NewGuid(), plan.FirstDay())));
      NavigationManager.NavigateTo("/session");
    }
  }
}
