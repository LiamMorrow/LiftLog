namespace LiftLog.Ui.Services;

public class PreferencesRepository(IPreferenceStore preferenceStore)
{
    public async Task<string?> GetProTokenAsync()
    {
#if TEST_MODE
        await Task.Yield();
        return null;
#else
        var token = await preferenceStore.GetItemAsync("proToken");
        if (Guid.TryParse(token, out var _))
            return null;
        else
            return token;
#endif
    }

    public async Task SetProTokenAsync(string? token)
    {
        if (token is not null)
            await preferenceStore.SetItemAsync("proToken", token);
    }

    public async Task<bool> GetUseImperialUnitsAsync()
    {
        var useImperialUnits = await preferenceStore.GetItemAsync("useImperialUnits");
        return useImperialUnits is "True";
    }

    public async Task SetUseImperialUnitsAsync(bool useImperialUnits)
    {
        await preferenceStore.SetItemAsync("useImperialUnits", useImperialUnits.ToString());
    }

    public async Task SetShowBodyweightAsync(bool showBodyweight)
    {
        await preferenceStore.SetItemAsync("showBodyweight", showBodyweight.ToString());
    }

    public async Task<bool> GetShowBodyweightAsync()
    {
        return await preferenceStore.GetItemAsync("showBodyweight") is "True" or null;
    }
}
