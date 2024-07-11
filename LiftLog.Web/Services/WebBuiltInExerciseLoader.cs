using System.Net.Http.Json;
using LiftLog.Ui.Services;

namespace LiftLog.Web.Services;

public class WebBuiltInExerciseLoader(HttpClient httpClient) : IBuiltInExerciseLoader
{
    public async Task<IReadOnlyList<DescribedExercise>> LoadBuiltInExercisesAsync()
    {
        var response = await httpClient.GetAsync("/exercises.txt");
        if (!response.IsSuccessStatusCode)
            return [];
        return await response.Content.ReadFromJsonAsync<List<DescribedExercise>>() ?? [];
    }
}
