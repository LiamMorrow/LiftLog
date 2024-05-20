// ReSharper disable UnusedMember.Global

using System.Collections.Immutable;
using System.Text.Json;
using Fluxor;
using Google.Protobuf;
using LiftLog.Lib.Services;
using LiftLog.Ui.Models.ExportedDataDao;
using LiftLog.Ui.Models.ProgramBlueprintDao;
using LiftLog.Ui.Models.SessionHistoryDao;
using LiftLog.Ui.Services;
using LiftLog.Ui.Store.Program;
using Microsoft.Extensions.Logging;

namespace LiftLog.Ui.Store.Settings;

public class SettingsEffects(
    ProgressRepository progressRepository,
    IState<ProgramState> programState,
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
        var sessions = await progressRepository.GetOrderedSessions().ToListAsync();
        var savedPrograms = programState.Value.SavedPrograms;
        var activeProgramId = programState.Value.ActivePlanId;

        await textExporter.ExportBytesAsync(
            new ExportedDataDaoV2(
                sessions.Select(SessionDaoV2.FromModel),
                savedPrograms.ToDictionary(
                    x => x.Key.ToString(),
                    x => ProgramBlueprintDaoV1.FromModel(x.Value)
                ),
                activeProgramId
            ).ToByteArray()
        );
    }

    [EffectMethod]
    public async Task ImportData(ImportDataAction action, IDispatcher dispatcher)
    {
        ExportedDataDaoV2? Deserialize(byte[] bytes)
        {
            try
            {
                return ExportedDataDaoV2.Parser.ParseFrom(bytes);
            }
            catch (InvalidProtocolBufferException v2Ex)
            {
                // Try to deserialize as v1
                try
                {
                    var v1 = JsonSerializer.Deserialize(
                        bytes,
                        StorageJsonContext.Context.ExportedDataDaoV1
                    );
                    if (v1 is null)
                    {
                        return null;
                    }

                    return ExportedDataDaoV2.FromV1(v1);
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
                await progressRepository.SaveCompletedSessionsAsync(
                    deserialized.Sessions.Select(x => x.ToModel())
                );
                dispatcher.Dispatch(
                    new SetSavedPlansAction(
                        deserialized.SavedPrograms.ToImmutableDictionary(
                            x => Guid.Parse(x.Key),
                            x => x.Value.ToModel()
                        )
                    )
                );
                // Will be null when an old export which did not have an active program is imported
                // In this case, it will have an unnamed program, which will be set as the active program
                if (deserialized.ActiveProgramId is null)
                {
                    var newId = Guid.NewGuid();
                    dispatcher.Dispatch(new CreateSavedPlanAction(newId, "My Program"));
                    dispatcher.Dispatch(
                        new SetProgramSessionsAction(
                            newId,
                            deserialized.Program.Select(x => x.ToModel()).ToImmutableList()
                        )
                    );
                    dispatcher.Dispatch(new SetActiveProgramAction(newId));
                }
                else
                {
                    var id = Guid.Parse(deserialized.ActiveProgramId);
                    dispatcher.Dispatch(new SetActiveProgramAction(id));
                }
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
    public async Task HandleSetRestNotificationsAction(
        SetRestNotificationsAction action,
        IDispatcher dispatcher
    )
    {
        await preferencesRepository.SetRestNotificationsAsync(action.RestNotifications);
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

    [EffectMethod]
    public async Task HandleStatusBarFixAction(SetStatusBarFixAction action, IDispatcher dispatcher)
    {
        await preferencesRepository.SetStatusBarFixAsync(action.StatusBarFix);
    }
}
