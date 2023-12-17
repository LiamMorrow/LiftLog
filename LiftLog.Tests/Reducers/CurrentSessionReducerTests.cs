using LiftLog.Lib.Models;
using LiftLog.Ui.Store.CurrentSession;

namespace LiftLog.Tests.Reducers;

public class CurrentSessionReducerTests
{
    private static readonly CurrentSessionState _initialState =
        new(
            WorkoutSession: Sessions.CreateSession(
                null,
                session =>
                    session with
                    {
                        RecordedExercises = session
                            .RecordedExercises.SetItem(
                                0,
                                Sessions.CreateRecordedExercise(
                                    null,
                                    exercise =>
                                        exercise with
                                        {
                                            PerSetWeight = false,
                                            Weight = 10m,
                                            PotentialSets = Sessions
                                                .CreatePotentialSet(10m, isEmpty: true)
                                                .Repeat(exercise.Blueprint.Sets - 1)
                                                .Add(Sessions.CreatePotentialSet(10m))
                                        }
                                )
                            )
                            .SetItem(
                                1,
                                Sessions.CreateRecordedExercise(
                                    null,
                                    exercise =>
                                        exercise with
                                        {
                                            PerSetWeight = true,
                                            Weight = 20m,
                                            PotentialSets = Sessions
                                                .CreatePotentialSet(20m, isEmpty: true)
                                                .Repeat(exercise.Blueprint.Sets - 1)
                                                .Add(Sessions.CreatePotentialSet(60m))
                                        }
                                )
                            )
                    }
            ),
            HistorySession: null,
            LatestSetTimerNotificationId: null
        );

    [Fact]
    public void WhenPerSetWeightIsFalseItShouldAlwaysUpdateAllSetsEvenIfOneIsCompleted()
    {
        var action = new UpdateExerciseWeightAction(
            Target: SessionTarget.WorkoutSession,
            ExerciseIndex: 0,
            Weight: 50m
        );

        var newState = CurrentSessionReducers.UpdateExerciseWeight(_initialState, action);

        newState.WorkoutSession!.RecordedExercises[0].Weight.Should().Be(50m);
        newState
            .WorkoutSession!.RecordedExercises[0]
            .PotentialSets.Should()
            .AllSatisfy(x => x.Weight.Should().Be(50m));
    }

    [Fact]
    public void WhenPerSetWeightIsTrueItShouldOnlyUpdateSetsWhichAreIncomplete()
    {
        var action = new UpdateExerciseWeightAction(
            Target: SessionTarget.WorkoutSession,
            ExerciseIndex: 1,
            Weight: 50m
        );

        var newState = CurrentSessionReducers.UpdateExerciseWeight(_initialState, action);

        newState.WorkoutSession!.RecordedExercises[1].Weight.Should().Be(50m);
        newState
            .WorkoutSession!.RecordedExercises[1]
            .PotentialSets.Take(2)
            .Should()
            .AllSatisfy(x => x.Weight.Should().Be(50m));
        newState.WorkoutSession!.RecordedExercises[1].PotentialSets[2].Weight.Should().Be(60m);
    }
}
