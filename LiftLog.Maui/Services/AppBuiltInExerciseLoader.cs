using System.Text.Json;
using System.Text.Json.Serialization;
using LiftLog.Lib;
using LiftLog.Lib.Serialization;
using LiftLog.Ui.Services;

namespace LiftLog.Maui.Services;

public class AppBuiltInExerciseLoader : IBuiltInExerciseLoader
{
    public async Task<IReadOnlyList<DescribedExercise>> LoadBuiltInExercisesAsync()
    {
        using var stream = await FileSystem.OpenAppPackageFileAsync("exercises.txt");
        if (stream == null)
            return [];

        var json = await JsonSerializer.DeserializeAsync(
            stream,
            JsonContext.Context.ListDescribedExercise
        );
        return json ?? [];
    }
}

[JsonSerializable(typeof(List<DescribedExercise>))]
internal partial class JsonContext : JsonSerializerContext
{
    public static readonly JsonContext Context = new(JsonSerializerSettings.LiftLog);
}
