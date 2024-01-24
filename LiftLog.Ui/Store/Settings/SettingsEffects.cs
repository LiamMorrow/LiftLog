// ReSharper disable UnusedMember.Global

using System.Collections.Immutable;
using System.Text.Json;
using Fluxor;
using Google.Protobuf;
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
    IExporter textExporter,
    IAiWorkoutPlanner aiWorkoutPlanner,
    IThemeProvider themeProvider,
    ILogger<SettingsEffects> logger,
    PreferencesRepository preferencesRepository
)
{
    [EffectMethod]
    public async Task ExportData(ExportDataAction _, IDispatcher __)
    {
        var sessions = await ProgressRepository.GetOrderedSessions().ToListAsync();
        var program = await ProgramRepository.GetSessionsInProgramAsync();

        await textExporter.ExportBytesAsync(
            new SettingsStorageDaoV2(
                sessions.Select(SessionDaoV2.FromModel),
                program.Select(SessionBlueprintDaoV2.FromModel)
            ).ToByteArray()
        );
    }

    [EffectMethod]
    public async Task ImportData(ImportDataAction action, IDispatcher dispatcher)
    {
        SettingsStorageDaoV2? Deserialize(byte[] bytes)
        {
            try
            {
                return SettingsStorageDaoV2.Parser.ParseFrom(bytes);
            }
            catch (InvalidProtocolBufferException v2Ex)
            {
                // Try to deserialize as v1
                try
                {
                    var v1 = JsonSerializer.Deserialize<SettingsStorageDaoV1>(
                        bytes,
                        StorageJsonContext.Context.SettingsStorageDaoV1
                    );
                    if (v1 is null)
                    {
                        return null;
                    }

                    return new SettingsStorageDaoV2(
                        v1.Sessions.Select(x => x.ToModel()).Select(SessionDaoV2.FromModel),
                        v1.Program.Select(x => x.ToModel()).Select(SessionBlueprintDaoV2.FromModel)
                    );
                }
                catch (Exception ex)
                {
                    logger.LogWarning(
                        "Could not deserialize as v1 or v2: V1 Exception:{ex}, \nV2 Exception {v2Ex}",
                        ex,
                        v2Ex
                    );
                    return null;
                }
            }
        }

        try
        {
            var importBytes = await textExporter.ImportBytesAsync();
            if (importBytes is null || importBytes.Length == 0)
                return;
            var deserialized = Deserialize(importBytes);
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
                logger.LogError("Could not deserialize data for import {data}", importBytes);
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

    [EffectMethod]
    public async Task HandleSetUseImperialUnitsAction(
        SetUseImperialUnitsAction action,
        IDispatcher dispatcher
    )
    {
        await preferencesRepository.SetUseImperialUnitsAsync(action.UseImperialUnits);
    }

    [EffectMethod]
    public async Task HandleSetShowBodyweightAction(
        SetShowBodyweightAction action,
        IDispatcher dispatcher
    )
    {
        await preferencesRepository.SetShowBodyweightAsync(action.ShowBodyweight);
    }

    [EffectMethod]
    public async Task HandleSetShowTipsAction(SetShowTipsAction action, IDispatcher dispatcher)
    {
        await preferencesRepository.SetShowTipsAsync(action.ShowTips);
    }

    [EffectMethod]
    public async Task HandleSetTipToShowAction(SetTipToShowAction action, IDispatcher dispatcher)
    {
        await preferencesRepository.SetTipToShowAsync(action.TipToShow);
    }

    [EffectMethod]
    public async Task HandleShowFeedAction(SetShowFeedAction action, IDispatcher dispatcher)
    {
        await preferencesRepository.SetShowFeedAsync(action.ShowFeed);
    }
}
