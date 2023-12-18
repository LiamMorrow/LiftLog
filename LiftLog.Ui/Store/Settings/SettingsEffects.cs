// ReSharper disable UnusedMember.Global

using System.Collections.Immutable;
using System.Text.Json;
using Fluxor;
using LiftLog.Lib;
using LiftLog.Lib.Models;
using LiftLog.Lib.Serialization;
using LiftLog.Lib.Services;
using LiftLog.Ui.Models.SessionBlueprintDao;
using LiftLog.Ui.Models.SessionHistoryDao;
using LiftLog.Ui.Models.SettingsStorageDao;
using LiftLog.Ui.Repository;
using LiftLog.Ui.Services;
using LiftLog.Ui.Store.Program;
using LiftLog.Ui.Util;
using Microsoft.Extensions.Logging;

namespace LiftLog.Ui.Store.Settings;

public class SettingsEffects(
    IProgressRepository ProgressRepository,
    ICurrentProgramRepository ProgramRepository,
    ITextExporter textExporter,
    IAiWorkoutPlanner aiWorkoutPlanner,
    IThemeProvider themeProvider,
    ILogger<SettingsEffects> logger
)
{
    [EffectMethod]
    public async Task ExportData(ExportDataAction _, IDispatcher __)
    {
        var sessions = await ProgressRepository.GetOrderedSessions().ToListAsync();
        var program = await ProgramRepository.GetSessionsInProgramAsync();

        await textExporter.ExportTextAsync(
            JsonSerializer.Serialize(
                new SettingsStorageDaoV1(
                    sessions.Select(SessionDaoV1.FromModel).ToList(),
                    program.Select(SessionBlueprintDaoV1.FromModel).ToImmutableList()
                ),
                StorageJsonContext.Context.SettingsStorageDaoV1
            )
        );
    }

    [EffectMethod]
    public async Task ImportData(ImportDataAction action, IDispatcher dispatcher)
    {
        try
        {
            var importText = await textExporter.ImportTextAsync();
            if (string.IsNullOrEmpty(importText))
                return;
            var deserialized = JsonSerializer.Deserialize<SettingsStorageDaoV1>(
                importText,
                StorageJsonContext.Context.SettingsStorageDaoV1
            );
            if (deserialized != null)
            {
                await ProgressRepository.SaveCompletedSessionsAsync(
                    deserialized.Sessions.Select(x => x.ToModel())
                );
                dispatcher.Dispatch(
                    new SetProgramSessionsAction(
                        deserialized.Program.Select(x => x.ToModel()).ToImmutableList()
                    )
                );
            }
            else
            {
                logger.LogWarning("Could not deserialize data for import {data}", importText);
            }
        }
        catch (JsonException ex)
        {
            logger.LogError(ex, "Error importing");
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

    [EffectMethod]
    public async Task SetTheme(SetThemeAction action, IDispatcher __)
    {
        await themeProvider.SetSeedColor(action.Seed, action.ThemePreference);
    }
}
