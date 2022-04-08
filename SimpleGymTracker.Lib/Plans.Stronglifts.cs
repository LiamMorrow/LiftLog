using SimpleGymTracker.Lib.Models;
using static SimpleGymTracker.Lib.Util;

namespace SimpleGymTracker.Lib
{
    public static partial class Plans
    {
        private static readonly Rest s_strongliftsRest =
            new(TimeSpan.FromSeconds(90), TimeSpan.FromSeconds(180), TimeSpan.FromSeconds(300));

        private static readonly WorkoutPlan s_stronglifts =
            new(
                "Stronglifts 5x5",
                ListOf(
                    new WorkoutPlanDay(
                        "Workout A",
                        ListOf(
                            new WorkoutPlanWeightedExercise(
                                "Squat",
                                Sets: 5,
                                RepsPerSet: 5,
                                InitialKilograms: 20,
                                KilogramsIncreaseOnSuccess: 2.5m,
                                s_strongliftsRest
                            ),
                            new WorkoutPlanWeightedExercise(
                                "Bench Press",
                                Sets: 5,
                                RepsPerSet: 5,
                                InitialKilograms: 20,
                                KilogramsIncreaseOnSuccess: 2.5m,
                                s_strongliftsRest
                            ),
                            new WorkoutPlanWeightedExercise(
                                "Barbell Row",
                                Sets: 5,
                                RepsPerSet: 5,
                                InitialKilograms: 20,
                                KilogramsIncreaseOnSuccess: 2.5m,
                                s_strongliftsRest
                            )
                        )
                    ),
                    new WorkoutPlanDay(
                        "Workout B",
                        ListOf(
                            new WorkoutPlanWeightedExercise(
                                "Squat",
                                Sets: 5,
                                RepsPerSet: 5,
                                InitialKilograms: 20,
                                KilogramsIncreaseOnSuccess: 2.5m,
                                s_strongliftsRest
                            ),
                            new WorkoutPlanWeightedExercise(
                                "Overhead Press",
                                Sets: 5,
                                RepsPerSet: 5,
                                InitialKilograms: 20,
                                KilogramsIncreaseOnSuccess: 2.5m,
                                s_strongliftsRest
                            ),
                            new WorkoutPlanWeightedExercise(
                                "Deadlift",
                                Sets: 1,
                                RepsPerSet: 5,
                                InitialKilograms: 20,
                                KilogramsIncreaseOnSuccess: 5m,
                                s_strongliftsRest
                            )
                        )
                    )
                )
            );
        private static readonly WorkoutPlan s_strongliftss =
            new(
                "Stronglifts 2x5",
                ListOf(
                    new WorkoutPlanDay(
                        "Workout A",
                        ListOf(
                            new WorkoutPlanWeightedExercise(
                                "Squat",
                                Sets: 1,
                                RepsPerSet: 2,
                                InitialKilograms: 20,
                                KilogramsIncreaseOnSuccess: 2.2m,
                                s_strongliftsRest
                            ),
                            new WorkoutPlanWeightedExercise(
                                "Squat",
                                Sets: 1,
                                RepsPerSet: 2,
                                InitialKilograms: 30,
                                KilogramsIncreaseOnSuccess: 2.2m,
                                s_strongliftsRest
                            ),
                            new WorkoutPlanWeightedExercise(
                                "Bench Press",
                                Sets: 2,
                                RepsPerSet: 2,
                                InitialKilograms: 20,
                                KilogramsIncreaseOnSuccess: 2.2m,
                                s_strongliftsRest
                            ),
                            new WorkoutPlanWeightedExercise(
                                "Barbell Row",
                                Sets: 2,
                                RepsPerSet: 2,
                                InitialKilograms: 20,
                                KilogramsIncreaseOnSuccess: 2.2m,
                                s_strongliftsRest
                            )
                        )
                    ),
                    new WorkoutPlanDay(
                        "Workout B",
                        ListOf(
                            new WorkoutPlanWeightedExercise(
                                "Squat",
                                Sets: 2,
                                RepsPerSet: 2,
                                InitialKilograms: 20,
                                KilogramsIncreaseOnSuccess: 2.2m,
                                s_strongliftsRest
                            ),
                            new WorkoutPlanWeightedExercise(
                                "Overhead Press",
                                Sets: 2,
                                RepsPerSet: 2,
                                InitialKilograms: 20,
                                KilogramsIncreaseOnSuccess: 2.2m,
                                s_strongliftsRest
                            ),
                            new WorkoutPlanWeightedExercise(
                                "Deadlift",
                                Sets: 1,
                                RepsPerSet: 2,
                                InitialKilograms: 20,
                                KilogramsIncreaseOnSuccess: 2m,
                                s_strongliftsRest
                            )
                        )
                    )
                )
            );
    }
}
