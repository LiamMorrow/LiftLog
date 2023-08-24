using System.Collections.Immutable;
using LiftLog.Lib;
using LiftLog.Lib.Models;

namespace LiftLog.Ui.Services;

public static class BuiltInProgramService
{
    public static readonly ImmutableListValue<ProgramBlueprint> BuiltInPrograms = ImmutableListValue.Of<ProgramBlueprint>(
        new ProgramBlueprint(
            "Starting Strength",
            Experience.Beginner,
            "Strength",
            3,
            ImmutableListValue.Of<SessionBlueprint>(
                new("Workout A", ImmutableListValue.Of<ExerciseBlueprint>(
                    new("Squat", 3, 5, 20, 2.5m, Rest.Medium),
                    new("Bench Press", 3, 5, 20, 2.5m, Rest.Medium),
                    new("Deadlift", 1, 5, 20, 5m, Rest.Medium)
                )),
                new("Workout B", ImmutableListValue.Of<ExerciseBlueprint>(
                    new("Squat", 3, 5, 20, 2.5m, Rest.Medium),
                    new("Overhead Press", 3, 5, 20, 2.5m, Rest.Medium),
                    new("Deadlift", 1, 5, 20, 5m, Rest.Medium)
                ))
            )
        ),
        new ProgramBlueprint(
            "Stronglifts 5x5",
            Experience.Beginner,
            "Strength",
            3,
            ImmutableListValue.Of<SessionBlueprint>(
                new("Workout A", ImmutableListValue.Of<ExerciseBlueprint>(
                    new("Squat", 5, 5, 20, 2.5m, Rest.Medium),
                    new("Bench Press", 5, 5, 20, 2.5m, Rest.Medium),
                    new("Barbell Row", 5, 5, 20, 2.5m, Rest.Medium)
                )),
                new("Workout B", ImmutableListValue.Of<ExerciseBlueprint>(
                    new("Squat", 5, 5, 20, 2.5m, Rest.Medium),
                    new("Overhead Press", 5, 5, 20, 2.5m, Rest.Medium),
                    new("Deadlift", 1, 5, 20, 5m, Rest.Medium)
                ))
            )
        ),
        new ProgramBlueprint(
            "PPL",
            Experience.Intermediate,
            "Muscle Mass",
            3,
            ImmutableListValue.Of<SessionBlueprint>(
                new("Push", ImmutableListValue.Of<ExerciseBlueprint>(
                    new("Bench Press", 4, 8, 20, 2.5m, Rest.Medium),
                    new("Overhead Press", 4, 8, 20, 2.5m, Rest.Medium),
                    new("Tricep Extension", 4, 8, 20, 2.5m, Rest.Medium),
                    new("Cable Fly", 4, 8, 20, 2.5m, Rest.Medium)
                )),
                new("Pull", ImmutableListValue.Of<ExerciseBlueprint>(
                    new("Deadlift", 4, 8, 20, 2.5m, Rest.Medium),
                    new("Barbell Row", 4, 8, 20, 2.5m, Rest.Medium),
                    new("Lat Pulldown", 4, 8, 20, 2.5m, Rest.Medium),
                    new("Barbell Curl", 4, 8, 20, 2.5m, Rest.Medium)
                )),
                new("Legs", ImmutableListValue.Of<ExerciseBlueprint>(
                    new("Squat", 4, 8, 20, 2.5m, Rest.Medium),
                    new("Lunges", 4, 8, 20, 2.5m, Rest.Medium),
                    new("Leg Extension", 4, 8, 20, 2.5m, Rest.Medium),
                    new("Leg Curl", 4, 8, 20, 2.5m, Rest.Medium)
                ))
            )
        ),
        new ProgramBlueprint(
            "PHUL",
            Experience.Intermediate,
            "Muscle Mass",
            4,
            ImmutableListValue.Of<SessionBlueprint>(
                new("Upper Power", ImmutableListValue.Of<ExerciseBlueprint>(
                    new("Bench Press", 3, 5, 20, 2.5m, Rest.Medium),
                    new("Barbell Row", 3, 5, 20, 2.5m, Rest.Medium),
                    new("Overhead Press", 3, 10, 20, 2.5m, Rest.Medium),
                    new("Lat Pulldown", 3, 10, 20, 2.5m, Rest.Medium),
                    new("Barbell Curl", 3, 10, 20, 2.5m, Rest.Medium),
                    new("Tricep Extension", 3, 10, 20, 2.5m, Rest.Medium),
                    new("Cable Fly", 3, 10, 20, 2.5m, Rest.Medium)
                )),
                new("Lower Power", ImmutableListValue.Of<ExerciseBlueprint>(
                    new("Squat", 3, 5, 20, 2.5m, Rest.Medium),
                    new("Deadlift", 3, 5, 20, 5m, Rest.Medium),
                    new("Leg Press", 3, 10, 20, 2.5m, Rest.Medium),
                    new("Leg Curl", 3, 10, 20, 2.5m, Rest.Medium),
                    new("Calf Raise", 3, 10, 20, 2.5m, Rest.Medium)
                )),
                new("Upper Hypertrophy", ImmutableListValue.Of<ExerciseBlueprint>(
                    new("Incline Bench Press", 3, 10, 20, 2.5m, Rest.Medium),
                    new("Cable Row", 3, 10, 20, 2.5m, Rest.Medium),
                    new("Dumbbell Fly", 3, 10, 20, 2.5m, Rest.Medium),
                    new("Lat Pulldown", 3, 10, 20, 2.5m, Rest.Medium),
                    new("Dumbbell Curl", 3, 10, 20, 2.5m, Rest.Medium),
                    new("Skullcrusher", 3, 10, 20, 2.5m, Rest.Medium)
                )),
                new("Lower Hypertrophy", ImmutableListValue.Of<ExerciseBlueprint>(
                    new("Front Squat", 3, 10, 20, 2.5m, Rest.Medium),
                    new("Romanian Deadlift", 3, 10, 20, 2.5m, Rest.Medium),
                    new("Leg Extension", 3, 10, 20, 2.5m, Rest.Medium),
                    new("Leg Curl", 3, 10, 20, 2.5m, Rest.Medium),
                    new("Calf Raise", 3, 10, 20, 2.5m, Rest.Medium)
                ))
            )
        )
    );
}
