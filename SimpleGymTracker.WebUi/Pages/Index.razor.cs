using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Fluxor;
using Microsoft.AspNetCore.Components;
using SimpleGymTracker.Lib;
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
        private readonly Dictionary<
            WorkoutPlanWeightedExercise,
            WorkoutWeightedExercise
        > _previousExercises = new();

        protected override async Task OnInitializedAsync()
        {
            await base.OnInitializedAsync();

            await foreach (var workoutDao in ProgressStore.GetAllWorkoutDaysAsync().Take(50))
            {
                _workouts.Add(workoutDao);
                foreach (var exercise in workoutDao.Day.WeightedExercises)
                {
                    _previousExercises.TryAdd(exercise.PlanExercise, exercise);
                }
                StateHasChanged();
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
        }
    }
}
