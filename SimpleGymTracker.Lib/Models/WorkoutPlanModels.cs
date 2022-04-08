using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Linq;
using static SimpleGymTracker.Lib.Util;

namespace SimpleGymTracker.Lib.Models
{
    public record Rest(TimeSpan MinRest, TimeSpan SecondaryRest, TimeSpan FailureRest);

    public record WorkoutPlanWeightedExercise(
        string Name,
        int Sets,
        int RepsPerSet,
        decimal InitialKilograms,
        decimal KilogramsIncreaseOnSuccess,
        Rest RestBetweenSets
    );

    public record WorkoutPlanDay(
        string Name,
        ImmutableListSequence<WorkoutPlanWeightedExercise> Exercises
    )
    {
        public WorkoutDay GetNextWorkout(
            WorkoutPlan plan,
            IReadOnlyDictionary<WorkoutPlanWeightedExercise, WorkoutWeightedExercise> latestWorkouts
        ) =>
            new(
                plan,
                this,
                ListOf(
                    Exercises.Select(
                        planExercise =>
                        {
                            var lastExercise = latestWorkouts.GetValueOrDefault(planExercise);
                            return new WorkoutWeightedExercise(
                                PlanExercise: planExercise,
                                Sets: ListOf(
                                    Enumerable.Repeat<WorkoutSet?>(null, planExercise.Sets)
                                ),
                                Weight: lastExercise?.SucceededAllSets ?? false
                                  ? lastExercise.Weight + planExercise.KilogramsIncreaseOnSuccess
                                  : lastExercise?.Weight ?? planExercise.InitialKilograms
                            );
                        }
                    )
                ),
                DateTimeOffset.UtcNow
            );
    }

    public record WorkoutPlan(string Name, ImmutableListSequence<WorkoutPlanDay> Days)
    {
        public WorkoutDay FirstDay(
            IReadOnlyDictionary<WorkoutPlanWeightedExercise, WorkoutWeightedExercise> latestWorkouts
        ) => Days[0].GetNextWorkout(this, latestWorkouts);

        public WorkoutPlanDay GetDayAfter(WorkoutPlanDay planDay) =>
            Days[(Days.IndexOf(planDay) + 1) % Days.Count];
    }
}
