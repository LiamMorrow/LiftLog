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

        It("should have the first exercise and set as the next exercise")
          .When(() =>
          {
            var nextExercise = session.NextExercise;
            nextExercise.Should().NotBeNull();
            nextExercise.Blueprint.Name.Should().Be(session.RecordedExercises[0].Blueprint.Name);
          });

        Describe("and the last completed set was the first exercise (not a superset)")
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

        Describe(
            "and the last completed set was the second exercise (a superset with the third exercise)"
          )
          .As(() =>
          {
            BeforeEach(() =>
            {
              session = CycleExerciseReps(1, 0);
            });

            It("Should have the next set be the third exercise")
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
            "and the last completed set was the third exercise (a superset with the previous exercise)"
          )
          .As(() =>
          {
            BeforeEach(() =>
            {
              session = CycleExerciseReps(2, 0);
            });

            It("Should have the next set be the second exercise")
              .When(() =>
              {
                var nextExercise = session.NextExercise;
                nextExercise.Should().NotBeNull();
                nextExercise
                  .Blueprint.Name.Should()
                  .Be(session.RecordedExercises[1].Blueprint.Name);
              });
          });
        Describe(
            "and the last completed set was the fourth exercise (a superset with the fifth and sixth exercise)"
          )
          .As(() =>
          {
            BeforeEach(() =>
            {
              session = CycleExerciseReps(3, 0);
            });

            It("Should have the next set be the fifth exercise")
              .When(() =>
              {
                var nextExercise = session.NextExercise;
                nextExercise.Should().NotBeNull();
                nextExercise
                  .Blueprint.Name.Should()
                  .Be(session.RecordedExercises[4].Blueprint.Name);
              });
          });

        Describe(
            "and the last completed set was the fifth exercise (a superset with the fourth and sixth exercise)"
          )
          .As(() =>
          {
            BeforeEach(() =>
            {
              session = CycleExerciseReps(4, 0);
            });

            It("Should have the next set be the sixth exercise")
              .When(() =>
              {
                var nextExercise = session.NextExercise;
                nextExercise.Should().NotBeNull();
                nextExercise
                  .Blueprint.Name.Should()
                  .Be(session.RecordedExercises[5].Blueprint.Name);
              });
          });

        Describe(
            "and the last completed set was the sixth exercise (a superset with the fourth and fifth exercise)"
          )
          .As(() =>
          {
            BeforeEach(() =>
            {
              session = CycleExerciseReps(4, 0);
            });

            It("Should have the next set be the fourth exercise")
              .When(() =>
              {
                var nextExercise = session.NextExercise;
                nextExercise.Should().NotBeNull();
                nextExercise
                  .Blueprint.Name.Should()
                  .Be(session.RecordedExercises[4].Blueprint.Name);
              });
          });
      }
    );
  }
}
