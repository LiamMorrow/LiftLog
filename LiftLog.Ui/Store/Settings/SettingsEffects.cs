// ReSharper disable UnusedMember.Global

using System.Collections.Immutable;
using System.Text.Json;
using Fluxor;
using LiftLog.Lib;
using LiftLog.Lib.Models;
using LiftLog.Lib.Serialization;
using LiftLog.Lib.Services;
using LiftLog.Lib.Store;
using LiftLog.Ui.Models.SessionBlueprintDao;
using LiftLog.Ui.Models.SessionHistoryDao;
using LiftLog.Ui.Services;
using LiftLog.Ui.Store.Program;
using LiftLog.Ui.Util;
using Microsoft.Extensions.Logging;

namespace LiftLog.Ui.Store.Settings;

public class SettingsEffects
{
    private readonly IProgressStore _progressStore;
    private readonly IProgramStore _programStore;
    private readonly ITextExporter _textExporter;
    private readonly IAiWorkoutPlanner aiWorkoutPlanner;
    private readonly ILogger<SettingsEffects> _logger;

    public SettingsEffects(
        IProgressStore progressStore,
        IProgramStore programStore,
        ITextExporter textExporter,
        IAiWorkoutPlanner aiWorkoutPlanner,
        ILogger<SettingsEffects> logger
    )
    {
        _progressStore = progressStore;
        _programStore = programStore;
        _textExporter = textExporter;
        this.aiWorkoutPlanner = aiWorkoutPlanner;
        _logger = logger;
    }

    [EffectMethod]
    public async Task ExportData(ExportDataAction _, IDispatcher __)
    {
        var sessions = await _progressStore.GetOrderedSessions().ToListAsync();
        var program = await _programStore.GetSessionsInProgramAsync();

        await _textExporter.ExportTextAsync(
            JsonSerializer.Serialize(new SerializedData(sessions.Select(SessionDaoV1.FromModel).ToList(), program.Select(SessionBlueprintDaoV1.FromModel).ToImmutableList()), JsonSerializerSettings.LiftLog)
        );
    }

    [EffectMethod]
    public async Task ImportData(ImportDataAction action, IDispatcher dispatcher)
    {
        try
        {
            var deserialized = JsonSerializer.Deserialize<SerializedData>(
                action.DataJson,
                JsonSerializerSettings.LiftLog
            );
            if (deserialized != null)
            {
                await _progressStore.SaveCompletedSessionsAsync(deserialized.Sessions.Select(x => x.ToModel()));
                dispatcher.Dispatch(new SetProgramSessionsAction(deserialized.Program.Select(x => x.ToModel()).ToImmutableList()));
            }
            else
            {
                _logger.LogWarning("Could not deserialize data for import {data}", action.DataJson);
            }
        }
        catch (JsonException ex)
        {
            _logger.LogError(ex, "Error importing");
        }
    }

    [EffectMethod]
    public async Task GenerateAiPlan(GenerateAiPlanAction action, IDispatcher dispatcher)
    {
        dispatcher.Dispatch(new SetAiPlanAttributesAction(action.Attributes));
        dispatcher.Dispatch(new SetIsGeneratingAiPlanAction(true));
        dispatcher.Dispatch(new SetAiPlanErrorAction(null));
        try
        {
            var program = await aiWorkoutPlanner.GenerateWorkoutPlanAsync(action.Attributes);
            dispatcher.Dispatch(new SetAiPlanAction(program));
        }
        catch (Exception ex)
        {
            dispatcher.Dispatch(new SetAiPlanErrorAction(ex.Message));
        }
        finally
        {
            dispatcher.Dispatch(new SetIsGeneratingAiPlanAction(false));
        }
    }

    private record SerializedData(
        List<SessionDaoV1> Sessions,
        ImmutableListSequence<SessionBlueprintDaoV1> Program
    );
}
