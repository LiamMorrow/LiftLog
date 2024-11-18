using LiftLog.Lib.Models;
using LiftLog.Ui.Store.CurrentSession;

namespace LiftLog.Tests.Reducers;

public class CurrentSessionReducerTests
{
  private static readonly CurrentSessionState _initialState = new(
    IsHydrated: true,
    WorkoutSession: Sessions.CreateSession(
      null,
      session =>
        session with
        {
          RecordedExercises = session
            .RecordedExercises.SetItem(
              0,
              Sessions.CreateRecordedExercise(
                exerciseIndex: 0,
                null,
                exercise =>
                  exercise with
                  {
                    PerSetWeight = false,
                    Weight = 10m,
                    PotentialSets = Sessions
                      .CreatePotentialSet(10m, isEmpty: true)
                      .Repeat(exercise.Blueprint.Sets - 1)
                      .Add(Sessions.CreatePotentialSet(10m)),
                  }
              )
            )
            .SetItem(
              1,
              Sessions.CreateRecordedExercise(
                exerciseIndex: 1,
                null,
                exercise =>
                  exercise with
                  {
                    PerSetWeight = true,
                    Weight = 20m,
                    PotentialSets = Sessions
                      .CreatePotentialSet(20m, isEmpty: true)
                      .Repeat(exercise.Blueprint.Sets - 1)
                      .Add(Sessions.CreatePotentialSet(60m)),
                  }
              )
            ),
        }
    ),
    HistorySession: null,
    FeedSession: null,
    LatestSetTimerNotificationId: null
  );

  [Describe("CurrentSessionReducer")]
  public static void Spec()
  {
    CurrentSessionState state = _initialState;

    BeforeEach(() =>
    {
      state = _initialState;
    });

    Describe("When PerSetWeight is true")
      .As(() =>
      {
        BeforeEach(() =>
        {
          state = _initialState with
          {
            WorkoutSession = _initialState.WorkoutSession! with
            {
              RecordedExercises = _initialState.WorkoutSession!.RecordedExercises.SetItem(
                1,
                _initialState.WorkoutSession!.RecordedExercises[1] with
                {
                  PerSetWeight = true,
                }
              ),
            },
          };
        });

        It("Should only update sets which are incomplete")
          .When(() =>
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
          });
      });

    Describe("When PerSetWeight is false")
      .As(() =>
      {
        It("Should always update all sets to have the same weight even if one is completed")
          .When(() =>
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
          });
      });
  }
}
