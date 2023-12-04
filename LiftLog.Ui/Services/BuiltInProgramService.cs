using LiftLog.Lib;
using LiftLog.Lib.Models;

namespace LiftLog.Ui.Services;

public static class BuiltInProgramService
{
    public static readonly ImmutableListValue<ProgramBlueprint> BuiltInPrograms =
    [
        new ProgramBlueprint(
            "Starting Strength",
            Experience.Beginner,
            "Strength",
            3,
            [
                new(
                    "Workout A",
                    [
                        new("Squat", 3, 5, 20, 2.5m, Rest.Medium, false),
                        new("Bench Press", 3, 5, 20, 2.5m, Rest.Medium, false),
                        new("Deadlift", 1, 5, 20, 5m, Rest.Medium, false)
                    ]
                ),
                new(
                    "Workout B",
                    [
                        new("Squat", 3, 5, 20, 2.5m, Rest.Medium, false),
                        new("Overhead Press", 3, 5, 20, 2.5m, Rest.Medium, false),
                        new("Deadlift", 1, 5, 20, 5m, Rest.Medium, false)
                    ]
                )
            ]
        ),
        new ProgramBlueprint(
            "Stronglifts 5x5",
            Experience.Beginner,
            "Strength",
            3,
            [
                new(
                    "Workout A",
                    [
                        new("Squat", 5, 5, 20, 2.5m, Rest.Medium, false),
                        new("Bench Press", 5, 5, 20, 2.5m, Rest.Medium, false),
                        new("Barbell Row", 5, 5, 20, 2.5m, Rest.Medium, false)
                    ]
                ),
                new(
                    "Workout B",
                    [
                        new("Squat", 5, 5, 20, 2.5m, Rest.Medium, false),
                        new("Overhead Press", 5, 5, 20, 2.5m, Rest.Medium, false),
                        new("Deadlift", 1, 5, 20, 5m, Rest.Medium, false)
                    ]
                )
            ]
        ),
        new ProgramBlueprint(
            "PPL",
            Experience.Intermediate,
            "Muscle Mass",
            3,
            [
                new(
                    "Push",
                    [
                        new("Bench Press", 4, 8, 20, 2.5m, Rest.Medium, false),
                        new("Overhead Press", 4, 8, 20, 2.5m, Rest.Medium, false),
                        new("Tricep Extension", 4, 8, 20, 2.5m, Rest.Medium, false),
                        new("Cable Fly", 4, 8, 20, 2.5m, Rest.Medium, false)
                    ]
                ),
                new(
                    "Pull",
                    [
                        new("Deadlift", 4, 8, 20, 2.5m, Rest.Medium, false),
                        new("Barbell Row", 4, 8, 20, 2.5m, Rest.Medium, false),
                        new("Lat Pulldown", 4, 8, 20, 2.5m, Rest.Medium, false),
                        new("Barbell Curl", 4, 8, 20, 2.5m, Rest.Medium, false)
                    ]
                ),
                new(
                    "Legs",
                    [
                        new("Squat", 4, 8, 20, 2.5m, Rest.Medium, false),
                        new("Lunges", 4, 8, 20, 2.5m, Rest.Medium, false),
                        new("Leg Extension", 4, 8, 20, 2.5m, Rest.Medium, false),
                        new("Leg Curl", 4, 8, 20, 2.5m, Rest.Medium, false)
                    ]
                )
            ]
        ),
        new ProgramBlueprint(
            "PHUL",
            Experience.Intermediate,
            "Muscle Mass",
            4,
            [
                new(
                    "Upper Power",
                    [
                        new("Bench Press", 3, 5, 20, 2.5m, Rest.Medium, false),
                        new("Barbell Row", 3, 5, 20, 2.5m, Rest.Medium, false),
                        new("Overhead Press", 3, 10, 20, 2.5m, Rest.Medium, false),
                        new("Lat Pulldown", 3, 10, 20, 2.5m, Rest.Medium, false),
                        new("Barbell Curl", 3, 10, 20, 2.5m, Rest.Medium, false),
                        new("Tricep Extension", 3, 10, 20, 2.5m, Rest.Medium, false),
                        new("Cable Fly", 3, 10, 20, 2.5m, Rest.Medium, false)
                    ]
                ),
                new(
                    "Lower Power",
                    [
                        new("Squat", 3, 5, 20, 2.5m, Rest.Medium, false),
                        new("Deadlift", 3, 5, 20, 5m, Rest.Medium, false),
                        new("Leg Press", 3, 10, 20, 2.5m, Rest.Medium, false),
                        new("Leg Curl", 3, 10, 20, 2.5m, Rest.Medium, false),
                        new("Calf Raise", 3, 10, 20, 2.5m, Rest.Medium, false)
                    ]
                ),
                new(
                    "Upper Hypertrophy",
                    [
                        new("Incline Bench Press", 3, 10, 20, 2.5m, Rest.Medium, false),
                        new("Cable Row", 3, 10, 20, 2.5m, Rest.Medium, false),
                        new("Dumbbell Fly", 3, 10, 20, 2.5m, Rest.Medium, false),
                        new("Lat Pulldown", 3, 10, 20, 2.5m, Rest.Medium, false),
                        new("Dumbbell Curl", 3, 10, 20, 2.5m, Rest.Medium, false),
                        new("Skullcrusher", 3, 10, 20, 2.5m, Rest.Medium, false)
                    ]
                ),
                new(
                    "Lower Hypertrophy",
                    [
                        new("Front Squat", 3, 10, 20, 2.5m, Rest.Medium, false),
                        new("Romanian Deadlift", 3, 10, 20, 2.5m, Rest.Medium, false),
                        new("Leg Extension", 3, 10, 20, 2.5m, Rest.Medium, false),
                        new("Leg Curl", 3, 10, 20, 2.5m, Rest.Medium, false),
                        new("Calf Raise", 3, 10, 20, 2.5m, Rest.Medium, false)
                    ]
                )
            ]
        ),
        new ProgramBlueprint(
            "Light Calisthenics",
            Experience.Beginner,
            "Toning",
            3,
            [
                new(
                    "Push",
                    [
                        new("Pushups", 3, 10, 20, 0m, Rest.Medium, false),
                        new("Dips", 3, 10, 20, 0m, Rest.Medium, false),
                        new("Handstand Pushups", 3, 10, 20, 0m, Rest.Medium, false)
                    ]
                ),
                new(
                    "Pull",
                    [
                        new("Pullups", 3, 10, 20, 0m, Rest.Medium, false),
                        new("Chinups", 3, 10, 20, 0m, Rest.Medium, false),
                        new("Inverted Rows", 3, 10, 20, 0m, Rest.Medium, false)
                    ]
                ),
                new(
                    "Legs",
                    [
                        new("Squats", 3, 10, 20, 0m, Rest.Medium, false),
                        new("Lunges", 3, 10, 20, 0m, Rest.Medium, false),
                        new("Calf Raises", 3, 10, 20, 0m, Rest.Medium, false)
                    ]
                )
            ]
        ),
        new ProgramBlueprint(
            "Heavy Calisthenics",
            Experience.Intermediate,
            "Toning",
            3,
            [
                new(
                    "Push",
                    [
                        new("Pushups", 3, 10, 20, 0m, Rest.Medium, false),
                        new("Dips", 3, 10, 20, 0m, Rest.Medium, false),
                        new("Handstand Pushups", 3, 10, 20, 0m, Rest.Medium, false),
                        new("Planche Pushups", 3, 10, 20, 0m, Rest.Medium, false)
                    ]
                ),
                new(
                    "Pull",
                    [
                        new("Pullups", 3, 10, 20, 0m, Rest.Medium, false),
                        new("Chinups", 3, 10, 20, 0m, Rest.Medium, false),
                        new("Inverted Rows", 3, 10, 20, 0m, Rest.Medium, false),
                        new("Muscle Ups", 3, 10, 20, 0m, Rest.Medium, false)
                    ]
                ),
                new(
                    "Legs",
                    [
                        new("Squats", 3, 10, 20, 0m, Rest.Medium, false),
                        new("Lunges", 3, 10, 20, 0m, Rest.Medium, false),
                        new("Calf Raises", 3, 10, 20, 0m, Rest.Medium, false),
                        new("Pistol Squats", 3, 10, 20, 0m, Rest.Medium, false)
                    ]
                )
            ]
        )
    ];
}
