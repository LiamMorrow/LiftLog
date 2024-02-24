// ReSharper disable UnusedMember.Global

using System.Collections.Immutable;
using Fluxor;
using LiftLog.Lib;
using LiftLog.Lib.Services;
using LiftLog.Ui.Services;
using Microsoft.Extensions.Logging;

namespace LiftLog.Ui.Store.AiSessionCreator;

public class ProgramEffects(
    ProgressRepository progressRepository,
    IAiWorkoutPlanner aiWorkoutPlanner,
    ILogger<ProgramEffects> logger
)
{
    [EffectMethod]
    public async Task GenerateSessionAsync(GenerateAiSessionAction action, IDispatcher dispatcher)
    {
        dispatcher.Dispatch(new SetAiGeneratedSessionIsLoadingAction(true));
        try
        {
            var latestExercises = (await progressRepository.GetLatestRecordedExercisesAsync())
                .GroupBy(x => x.Key.Name)
                .ToImmutableDictionary(x => x.Key, x => x.First().Value.Weight);

            var generatedSession = await aiWorkoutPlanner.GenerateSessionAsync(
                new(
                    action.Attributes.AreasToWorkout,
                    action.Attributes.Volume,
                    latestExercises,
                    action.UseImperialUnits
                )
            );

            dispatcher.Dispatch(new SetAiGeneratedSessionAction(generatedSession));
        }
        catch (Exception e)
        {
            logger.LogError(e, "Failed to generate session");
            dispatcher.Dispatch(new SetAiSessionErrorMessageAction(e.Message));
        }
        finally
        {
            dispatcher.Dispatch(new SetAiGeneratedSessionIsLoadingAction(false));
        }
    }
}
