using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Fluxor;
using Microsoft.AspNetCore.Components;
using SimpleGymTracker.Lib.Models;
using SimpleGymTracker.Lib.Store;
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
    public IProgressStore ProgressStore { get; set; } = null!;

    [Inject]
    public NavigationManager NavigationManager { get; set; } = null!;

    private readonly List<WorkoutDayDao> _workouts = new();

    protected override async Task OnInitializedAsync()
    {
      await base.OnInitializedAsync();
      await foreach (var workoutDao in ProgressStore.GetAllWorkoutDaysAsync())
      {
        _workouts.Add(workoutDao);
        this.StateHasChanged();
      }
    }

    private void SelectSession(WorkoutDayDao day)
    {
      Dispatcher.Dispatch(new SelectPlanAction(day.Day.Plan));
      Dispatcher.Dispatch(new SetWorkoutDayAction(day));
      NavigationManager.NavigateTo("/session");
    }

    private void SelectWorkoutPlan(WorkoutPlan plan)
    {
      Dispatcher.Dispatch(new SelectPlanAction(plan));
      Dispatcher.Dispatch(new SetWorkoutDayAction(new WorkoutDayDao(Guid.NewGuid(), plan.FirstDay())));
      NavigationManager.NavigateTo("/session");
    }
  }
}
