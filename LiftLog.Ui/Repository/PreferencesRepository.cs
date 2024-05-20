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

    public async Task<bool> GetRestNotificationsAsync()
    {
        return await preferenceStore.GetItemAsync("restNotifications") is "True" or null;
    }

    public async Task SetRestNotificationsAsync(bool restNotifications)
    {
        await preferenceStore.SetItemAsync("restNotifications", restNotifications.ToString());
    }

    public async Task SetShowBodyweightAsync(bool showBodyweight)
    {
        await preferenceStore.SetItemAsync("showBodyweight", showBodyweight.ToString());
    }

    public async Task<bool> GetShowBodyweightAsync()
    {
        return await preferenceStore.GetItemAsync("showBodyweight") is "True" or null;
    }

    public async Task SetShowTipsAsync(bool showTips)
    {
        await preferenceStore.SetItemAsync("showTips", showTips.ToString());
    }

    public async Task<bool> GetShowTipsAsync()
    {
        return await preferenceStore.GetItemAsync("showTips") is "True" or null;
    }

    public async Task SetTipToShowAsync(int tipToShow)
    {
        await preferenceStore.SetItemAsync("tipToShow", tipToShow.ToString());
    }

    public async Task<int> GetTipToShowAsync()
    {
        var tipToShow = await preferenceStore.GetItemAsync("tipToShow");
        if (int.TryParse(tipToShow, out var tipToShowInt))
            return tipToShowInt;
        else
            return 1;
    }

    public async Task SetShowFeedAsync(bool showFeed)
    {
        await preferenceStore.SetItemAsync("showFeed", showFeed.ToString());
    }

    public async Task<bool> GetShowFeedAsync()
    {
        return await preferenceStore.GetItemAsync("showFeed") is "True" or null;
    }

    public async Task SetStatusBarFixAsync(bool statusBarFix)
    {
        await preferenceStore.SetItemAsync("statusBarFix", statusBarFix.ToString());
    }

    public async Task<bool> GetStatusBarFixAsync()
    {
        return await preferenceStore.GetItemAsync("statusBarFix") is "True";
    }
}
