// ReSharper disable UnusedMember.Global

using System.Collections.Immutable;
using Fluxor;
using LiftLog.Lib;
using LiftLog.Lib.Services;
using LiftLog.Ui.Repository;
using LiftLog.Ui.Services;
using LiftLog.Ui.Util;
using Microsoft.Extensions.Logging;

namespace LiftLog.Ui.Store.AiSessionCreator;

public class ProgramEffects
{
    private readonly IProgressRepository progressRepository;
    private readonly IAiWorkoutPlanner aiWorkoutPlanner;
    private readonly IState<AiSessionCreatorState> state;
    private readonly ILogger<ProgramEffects> logger;

    public ProgramEffects(
        IProgressRepository progressRepository,
        IAiWorkoutPlanner aiWorkoutPlanner,
        IState<AiSessionCreatorState> state,
        ILogger<ProgramEffects> logger
    )
    {
        this.progressRepository = progressRepository;
        this.aiWorkoutPlanner = aiWorkoutPlanner;
        this.state = state;
        this.logger = logger;
    }

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
