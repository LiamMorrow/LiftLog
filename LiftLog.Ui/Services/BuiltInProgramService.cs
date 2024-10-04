using System.Collections.Immutable;
using LiftLog.Lib;
using LiftLog.Lib.Models;

namespace LiftLog.Ui.Services;

public static class BuiltInProgramService
{
    public static readonly ImmutableDictionary<Guid, ProgramBlueprint> BuiltInPrograms =
        new Dictionary<Guid, ProgramBlueprint>
        {
            [Guid.Parse("A303C855-9ED7-4FF8-AE60-11E9A573193E")] = new ProgramBlueprint(
                "Starting Strength",
                [
                    new(
                        "Workout A",
                        [
                            new("Squat", 3, 5, 2.5m, Rest.Medium, false, "", Link: ""),
                            new("Bench Press", 3, 5, 2.5m, Rest.Medium, false, "", Link: ""),
                            new("Deadlift", 1, 5, 5m, Rest.Medium, false, "", Link: ""),
                        ],
                        ""
                    ),
                    new(
                        "Workout B",
                        [
                            new("Squat", 3, 5, 2.5m, Rest.Medium, false, "", Link: ""),
                            new("Overhead Press", 3, 5, 2.5m, Rest.Medium, false, "", Link: ""),
                            new("Deadlift", 1, 5, 5m, Rest.Medium, false, "", Link: ""),
                        ],
                        ""
                    ),
                ],
                LastEdited: new(2024, 1, 1)
            ),
            [Guid.Parse("AC80C322-3C0F-42BA-B837-CD998ADEE25A")] = new ProgramBlueprint(
                "Stronglifts 5x5",
                [
                    new(
                        "Workout A",
                        [
                            new("Squat", 5, 5, 2.5m, Rest.Medium, false, "", Link: ""),
                            new("Bench Press", 5, 5, 2.5m, Rest.Medium, false, "", Link: ""),
                            new("Barbell Row", 5, 5, 2.5m, Rest.Medium, false, "", Link: ""),
                        ],
                        ""
                    ),
                    new(
                        "Workout B",
                        [
                            new("Squat", 5, 5, 2.5m, Rest.Medium, false, "", Link: ""),
                            new("Overhead Press", 5, 5, 2.5m, Rest.Medium, false, "", Link: ""),
                            new("Deadlift", 1, 5, 5m, Rest.Medium, false, "", Link: ""),
                        ],
                        ""
                    ),
                ],
                LastEdited: new(2024, 1, 1)
            ),
            [Guid.Parse("347607F0-67B8-4051-BFC2-3B73FCCF92D8")] = new ProgramBlueprint(
                "PPL",
                [
                    new(
                        "Push",
                        [
                            new("Bench Press", 4, 8, 2.5m, Rest.Medium, false, "", Link: ""),
                            new("Overhead Press", 4, 8, 2.5m, Rest.Medium, false, "", Link: ""),
                            new("Tricep Extension", 4, 8, 2.5m, Rest.Medium, false, "", Link: ""),
                            new("Cable Fly", 4, 8, 2.5m, Rest.Medium, false, "", Link: ""),
                        ],
                        ""
                    ),
                    new(
                        "Pull",
                        [
                            new("Deadlift", 4, 8, 2.5m, Rest.Medium, false, "", Link: ""),
                            new("Barbell Row", 4, 8, 2.5m, Rest.Medium, false, "", Link: ""),
                            new("Lat Pulldown", 4, 8, 2.5m, Rest.Medium, false, "", Link: ""),
                            new("Barbell Curl", 4, 8, 2.5m, Rest.Medium, false, "", Link: ""),
                        ],
                        ""
                    ),
                    new(
                        "Legs",
                        [
                            new("Squat", 4, 8, 2.5m, Rest.Medium, false, "", Link: ""),
                            new("Lunges", 4, 8, 2.5m, Rest.Medium, false, "", Link: ""),
                            new("Leg Extension", 4, 8, 2.5m, Rest.Medium, false, "", Link: ""),
                            new("Leg Curl", 4, 8, 2.5m, Rest.Medium, false, "", Link: ""),
                        ],
                        ""
                    ),
                ],
                LastEdited: new(2024, 1, 1)
            ),
            [Guid.Parse("5072C29E-1DE9-44E0-865F-F65A15E860F7")] = new ProgramBlueprint(
                "PHUL",
                [
                    new(
                        "Upper Power",
                        [
                            new("Bench Press", 3, 5, 2.5m, Rest.Medium, false, "", Link: ""),
                            new("Barbell Row", 3, 5, 2.5m, Rest.Medium, false, "", Link: ""),
                            new("Overhead Press", 3, 10, 2.5m, Rest.Medium, false, "", Link: ""),
                            new("Lat Pulldown", 3, 10, 2.5m, Rest.Medium, false, "", Link: ""),
                            new("Barbell Curl", 3, 10, 2.5m, Rest.Medium, false, "", Link: ""),
                            new("Tricep Extension", 3, 10, 2.5m, Rest.Medium, false, "", Link: ""),
                            new("Cable Fly", 3, 10, 2.5m, Rest.Medium, false, "", Link: ""),
                        ],
                        ""
                    ),
                    new(
                        "Lower Power",
                        [
                            new("Squat", 3, 5, 2.5m, Rest.Medium, false, "", Link: ""),
                            new("Deadlift", 3, 5, 5m, Rest.Medium, false, "", Link: ""),
                            new("Leg Press", 3, 10, 2.5m, Rest.Medium, false, "", Link: ""),
                            new("Leg Curl", 3, 10, 2.5m, Rest.Medium, false, "", Link: ""),
                            new("Calf Raise", 3, 10, 2.5m, Rest.Medium, false, "", Link: ""),
                        ],
                        ""
                    ),
                    new(
                        "Upper Hypertrophy",
                        [
                            new(
                                "Incline Bench Press",
                                3,
                                10,
                                2.5m,
                                Rest.Medium,
                                false,
                                "",
                                Link: ""
                            ),
                            new("Cable Row", 3, 10, 2.5m, Rest.Medium, false, "", Link: ""),
                            new("Dumbbell Fly", 3, 10, 2.5m, Rest.Medium, false, "", Link: ""),
                            new("Lat Pulldown", 3, 10, 2.5m, Rest.Medium, false, "", Link: ""),
                            new("Dumbbell Curl", 3, 10, 2.5m, Rest.Medium, false, "", Link: ""),
                            new("Skullcrusher", 3, 10, 2.5m, Rest.Medium, false, "", Link: ""),
                        ],
                        ""
                    ),
                    new(
                        "Lower Hypertrophy",
                        [
                            new("Front Squat", 3, 10, 2.5m, Rest.Medium, false, "", Link: ""),
                            new("Romanian Deadlift", 3, 10, 2.5m, Rest.Medium, false, "", Link: ""),
                            new("Leg Extension", 3, 10, 2.5m, Rest.Medium, false, "", Link: ""),
                            new("Leg Curl", 3, 10, 2.5m, Rest.Medium, false, "", Link: ""),
                            new("Calf Raise", 3, 10, 2.5m, Rest.Medium, false, "", Link: ""),
                        ],
                        ""
                    ),
                ],
                LastEdited: new(2024, 1, 1)
            ),
            [Guid.Parse("0D0E0860-0555-4B43-BD93-350EDD49C6BD")] = new ProgramBlueprint(
                "Light Calisthenics",
                [
                    new(
                        "Push",
                        [
                            new("Pushups", 3, 10, 0m, Rest.Medium, false, "", Link: ""),
                            new("Dips", 3, 10, 0m, Rest.Medium, false, "", Link: ""),
                            new("Handstand Pushups", 3, 10, 0m, Rest.Medium, false, "", Link: ""),
                        ],
                        ""
                    ),
                    new(
                        "Pull",
                        [
                            new("Pullups", 3, 10, 0m, Rest.Medium, false, "", Link: ""),
                            new("Chinups", 3, 10, 0m, Rest.Medium, false, "", Link: ""),
                            new("Inverted Rows", 3, 10, 0m, Rest.Medium, false, "", Link: ""),
                        ],
                        ""
                    ),
                    new(
                        "Legs",
                        [
                            new("Squats", 3, 10, 0m, Rest.Medium, false, "", Link: ""),
                            new("Lunges", 3, 10, 0m, Rest.Medium, false, "", Link: ""),
                            new("Calf Raises", 3, 10, 0m, Rest.Medium, false, "", Link: ""),
                        ],
                        ""
                    ),
                ],
                LastEdited: new(2024, 1, 1)
            ),
            [Guid.Parse("890A285B-F883-4536-A1CE-CBC9E2D90399")] = new ProgramBlueprint(
                "Heavy Calisthenics",
                [
                    new(
                        "Push",
                        [
                            new("Pushups", 3, 10, 0m, Rest.Medium, false, "", Link: ""),
                            new("Dips", 3, 10, 0m, Rest.Medium, false, "", Link: ""),
                            new("Handstand Pushups", 3, 10, 0m, Rest.Medium, false, "", Link: ""),
                            new("Planche Pushups", 3, 10, 0m, Rest.Medium, false, "", Link: ""),
                        ],
                        ""
                    ),
                    new(
                        "Pull",
                        [
                            new("Pullups", 3, 10, 0m, Rest.Medium, false, "", Link: ""),
                            new("Chinups", 3, 10, 0m, Rest.Medium, false, "", Link: ""),
                            new("Inverted Rows", 3, 10, 0m, Rest.Medium, false, "", Link: ""),
                            new("Muscle Ups", 3, 10, 0m, Rest.Medium, false, "", Link: ""),
                        ],
                        ""
                    ),
                    new(
                        "Legs",
                        [
                            new("Squats", 3, 10, 0m, Rest.Medium, false, "", Link: ""),
                            new("Lunges", 3, 10, 0m, Rest.Medium, false, "", Link: ""),
                            new("Calf Raises", 3, 10, 0m, Rest.Medium, false, "", Link: ""),
                            new("Pistol Squats", 3, 10, 0m, Rest.Medium, false, "", Link: ""),
                        ],
                        ""
                    ),
                ],
                LastEdited: new(2024, 1, 1)
            ),
        }.ToImmutableDictionary();
}
