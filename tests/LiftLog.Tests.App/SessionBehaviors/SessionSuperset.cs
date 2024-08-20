using LiftLog.Lib.Models;
using LiftLog.Ui.Store.CurrentSession;

namespace LiftLog.Tests.App.SessionBehaviors;

public class SessionSupersetTests
{
  [Describe("Session supersets")]
  public void Spec()
  {
    Describe(
      "When given a session with supersets",
      () =>
      {
        Session session = null!;
        CurrentSessionState GetState() => CurrentSessionState.FromWorkoutSession(session);
        Session CycleExerciseReps(int exerciseIndex, int setIndex) =>
          CurrentSessionReducers
            .CycleExerciseReps(
              GetState(),
              new CycleExerciseRepsAction(
                SessionTarget.WorkoutSession,
                ExerciseIndex: exerciseIndex,
                SetIndex: setIndex
              )
            )
            .WorkoutSession!;

        ExerciseBlueprint Exercise(int index, bool supersetWithNext) =>
          Blueprints.CreateExerciseBlueprint(x =>
            x with
            {
              Name = $"Ex{index}",
              SupersetWithNext = supersetWithNext
            }
          );

        BeforeEach(
          () =>
            session = Sessions.CreateSession(
              sessionBlueprint: Blueprints.CreateSessionBlueprint() with
              {
                Exercises =
                [
                  Exercise(0, supersetWithNext: false),
                  Exercise(1, supersetWithNext: true),
                  Exercise(2, supersetWithNext: false),
                  Exercise(3, supersetWithNext: true),
                  Exercise(4, supersetWithNext: true),
                  Exercise(5, supersetWithNext: false)
                ]
              },
              fillFirstSet: false
            )
        );

        It("should have exercise 0 set as the next exercise")
          .When(() =>
          {
            var nextExercise = session.NextExercise;
            nextExercise.Should().NotBeNull();
            nextExercise.Blueprint.Name.Should().Be(session.RecordedExercises[0].Blueprint.Name);
          });

        Describe("and the last completed set was exercise 0 (not a superset)")
          .As(() =>
          {
            BeforeEach(() =>
            {
              session = CycleExerciseReps(0, 0);
            });

            It(
              "Should have the next set be the first exercise",
              () =>
              {
                var nextExercise = session.NextExercise;
                nextExercise.Should().NotBeNull();
                nextExercise
                  .Blueprint.Name.Should()
                  .Be(session.RecordedExercises[0].Blueprint.Name);
              }
            );
          });

        Describe("and the last completed set was the exercise 1 (a superset with exercise 2)")
          .As(() =>
          {
            BeforeEach(() =>
            {
              session = CycleExerciseReps(1, 0);
            });

            It("Should have the next set be 2")
              .When(() =>
              {
                var nextExercise = session.NextExercise;
                nextExercise.Should().NotBeNull();
                nextExercise
                  .Blueprint.Name.Should()
                  .Be(session.RecordedExercises[2].Blueprint.Name);
              });
          });

        Describe(
            "and the last completed set was exercise 2 (a superset with the previous exercise (1))"
          )
          .As(() =>
          {
            BeforeEach(() =>
            {
              session = CycleExerciseReps(2, 0);
            });

            It("Should have the next set be 1")
              .When(() =>
              {
                var nextExercise = session.NextExercise;
                nextExercise.Should().NotBeNull();
                nextExercise
                  .Blueprint.Name.Should()
                  .Be(session.RecordedExercises[1].Blueprint.Name);
              });
          });

        Describe("and the last completed set was exercise 3 (a superset with the 4 and 5)")
          .As(() =>
          {
            BeforeEach(() =>
            {
              session = CycleExerciseReps(3, 0);
            });

            It("Should have the next set be 4")
              .When(() =>
              {
                var nextExercise = session.NextExercise;
                nextExercise.Should().NotBeNull();
                nextExercise
                  .Blueprint.Name.Should()
                  .Be(session.RecordedExercises[4].Blueprint.Name);
              });
          });

        Describe("and the last completed set was exercise 4 (a superset with the 3 and 5)")
          .As(() =>
          {
            BeforeEach(() =>
            {
              session = CycleExerciseReps(4, 0);
            });

            It("Should have the next set be 5")
              .When(() =>
              {
                var nextExercise = session.NextExercise;
                nextExercise.Should().NotBeNull();
                nextExercise
                  .Blueprint.Name.Should()
                  .Be(session.RecordedExercises[5].Blueprint.Name);
              });
          });

        Describe("and the last completed set was exercise 5 (a superset with the 3 and 4)")
          .As(() =>
          {
            BeforeEach(() =>
            {
              session = CycleExerciseReps(5, 0);
            });

            It("Should cycle back to exercise 3")
              .When(() =>
              {
                var nextExercise = session.NextExercise;
                nextExercise.Should().NotBeNull();
                nextExercise
                  .Blueprint.Name.Should()
                  .Be(session.RecordedExercises[3].Blueprint.Name);
              });
          });
      }
    );
  }
}
