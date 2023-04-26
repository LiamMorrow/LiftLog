// ReSharper disable UnusedMember.Global

using System.Text.Json;
using Fluxor;
using LiftLog.Lib;
using LiftLog.Lib.Models;
using LiftLog.Lib.Store;
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
    private readonly ILogger<SettingsEffects> _logger;
    private readonly JsonSerializerOptions _jsonSerializerOptions;


    public SettingsEffects(
        IProgressStore progressStore,
        IProgramStore programStore,
        ITextExporter textExporter,
        ILogger<SettingsEffects> logger
    )
    {
        _progressStore = progressStore;
        _programStore = programStore;
        _textExporter = textExporter;
        _logger = logger;
        _jsonSerializerOptions = new JsonSerializerOptions(JsonSerializerOptions.Default);
        _jsonSerializerOptions.Converters.Add(new TimespanJsonConverter());
    }

    [EffectMethod]
    public async Task ExportData(ExportDataAction _, IDispatcher __)
    {
        var sessions = await _progressStore.GetOrderedSessions();
        var program = await _programStore.GetSessionsInProgramAsync();

        await _textExporter.ExportTextAsync(
            JsonSerializer.Serialize(new SerializedData(
                    sessions,
                    program
                ),
                _jsonSerializerOptions));
    }

    [EffectMethod]
    public async Task ImportData(ImportDataAction action, IDispatcher dispatcher)
    {
        try
        {
            var deserialized = JsonSerializer.Deserialize<SerializedData>(action.DataJson, _jsonSerializerOptions);
            if (deserialized != null)
            {
                await _progressStore.SaveCompletedSessionsAsync(deserialized.Sessions);
                dispatcher.Dispatch(new SetProgramSessionsAction(deserialized.Program));
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

    private record SerializedData(List<Session> Sessions, ImmutableListSequence<SessionBlueprint> Program);
}