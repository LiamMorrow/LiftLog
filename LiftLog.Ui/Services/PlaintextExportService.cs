using System.Globalization;
using CsvHelper;
using Fluxor;
using LiftLog.Lib.Models;
using LiftLog.Ui.Models;
using LiftLog.Ui.Store.Settings;

namespace LiftLog.Ui.Services;

public class PlaintextExportService(
    IFileExportService fileExportService,
    ProgressRepository progressRepository,
    IState<SettingsState> settingsState
)
{
    public async Task ExportAsync(PlaintextExportFormat format)
    {
        var unit = settingsState.Value.UseImperialUnits ? "lbs" : "kg";
        var sessions = progressRepository.GetOrderedSessions();

        var (fileName, bytes, contentType) = format switch
        {
            PlaintextExportFormat.CSV => (
                "liftlog-export.csv",
                await ExportToCsv(sessions, unit),
                "text/csv"
            ),
        };

        await fileExportService.ExportBytesAsync(fileName, bytes, contentType);
    }

    private static async Task<byte[]> ExportToCsv(IAsyncEnumerable<Session> sessions, string unit)
    {
        var exportedSets = await sessions
            .SelectMany(s => s.RecordedExercises.Select(ex => (s, ex)).ToAsyncEnumerable())
            .SelectMany(
                (val) => ExportedSetCsvRow.FromModel(val.s, val.ex, unit).ToAsyncEnumerable()
            )
            .ToListAsync();
        using var memoryStream = new MemoryStream();
        using var writer = new StreamWriter(memoryStream);
        using var csv = new CsvWriter(writer, CultureInfo.InvariantCulture);
        csv.WriteRecords(exportedSets);
        csv.Flush();
        return memoryStream.ToArray();
    }
}

public record ExportedSetCsvRow(
    string SessionId,
    string Timestamp,
    string Exercise,
    decimal Weight,
    string WeightUnit,
    int Reps,
    int TargetReps,
    string Notes
)
{
    public static IEnumerable<ExportedSetCsvRow> FromModel(
        Session session,
        RecordedExercise exercise,
        string unit
    )
    {
        return exercise
            .PotentialSets.Where(x => x.Set is not null)
            .Select(set => new ExportedSetCsvRow(
                session.Id.ToString(),
                // s=sortable, ISO 8601 format without milliseconds or timezone
                session
                    .Date.ToDateTime(set.Set!.CompletionTime!, DateTimeKind.Local)
                    .ToString("s"),
                exercise.Blueprint.Name,
                set.Weight,
                unit,
                set.Set.RepsCompleted,
                exercise.Blueprint.RepsPerSet,
                exercise.Notes ?? ""
            ));
    }
}
