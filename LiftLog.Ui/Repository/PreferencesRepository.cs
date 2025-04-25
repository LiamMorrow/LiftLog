using LiftLog.Ui.Store.App;
using LiftLog.Ui.Store.Settings;

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

    public async Task<bool> GetHasRequestedNotificationPermissionAsync()
    {
        return await preferenceStore.GetItemAsync("hasRequestedNotificationPermission") is "True";
    }

    public async Task SetHasRequestedNotificationPermissionAsync(
        bool hasRequestedNotificationPermission
    )
    {
        await preferenceStore.SetItemAsync(
            "hasRequestedNotificationPermission",
            hasRequestedNotificationPermission.ToString()
        );
    }

    public async Task<int> GetAppOpenedCountAsync()
    {
        var appOpenedCount = await preferenceStore.GetItemAsync("appOpenedCount");
        if (int.TryParse(appOpenedCount, out var appOpenedCountInt))
            return appOpenedCountInt;
        else
            return 0;
    }

    public async Task SetAppOpenedCountAsync(int appOpenedCount)
    {
        await preferenceStore.SetItemAsync("appOpenedCount", appOpenedCount.ToString());
    }

    public async Task SetAppRatingResultAsync(AppRatingResult appRatingResult)
    {
        await preferenceStore.SetItemAsync("appRatingResult", appRatingResult.ToString());
    }

    public async Task<AppRatingResult> GetAppRatingResultAsync()
    {
        var appRatingResult = await preferenceStore.GetItemAsync("appRatingResult");
        if (Enum.TryParse<AppRatingResult>(appRatingResult, out var result))
            return result;
        else
            return AppRatingResult.NotRated;
    }

    public async Task<RemoteBackupSettings> GetRemoteBackupSettingsAsync()
    {
        var (endpoint, apiKey, includeFeedAccount) = await (
            preferenceStore.GetItemAsync("remoteBackupSettings.Endpoint").AsTask(),
            preferenceStore.GetItemAsync("remoteBackupSettings.ApiKey").AsTask(),
            preferenceStore.GetItemAsync("remoteBackupSettings.IncludeFeedAccount").AsTask()
        );
        return new RemoteBackupSettings(endpoint ?? "", apiKey ?? "", includeFeedAccount is "True");
    }

    public async Task SetRemoteBackupSettingsAsync(RemoteBackupSettings remoteBackupSettings)
    {
        await preferenceStore.SetItemAsync(
            "remoteBackupSettings.Endpoint",
            remoteBackupSettings.Endpoint
        );
        await preferenceStore.SetItemAsync(
            "remoteBackupSettings.ApiKey",
            remoteBackupSettings.ApiKey
        );
        await preferenceStore.SetItemAsync(
            "remoteBackupSettings.IncludeFeedAccount",
            remoteBackupSettings.IncludeFeedAccount.ToString()
        );
    }

    public async Task SetLastSuccessfulRemoteBackupHashAsync(string hash)
    {
        await preferenceStore.SetItemAsync("lastSuccessfulRemoteBackupHash", hash);
    }

    public async Task<string?> GetLastSuccessfulRemoteBackupHashAsync()
    {
        return await preferenceStore.GetItemAsync("lastSuccessfulRemoteBackupHash");
    }

    public async Task SetLastBackupTimeAsync(DateTimeOffset time)
    {
        await preferenceStore.SetItemAsync("lastBackupTime", time.ToString("O"));
    }

    public async Task<DateTimeOffset> GetLastBackupTimeAsync()
    {
        var lastBackupTime = await preferenceStore.GetItemAsync("lastBackupTime");
        if (DateTimeOffset.TryParse(lastBackupTime, out var time))
            return time;
        else
        {
            await SetLastBackupTimeAsync(DateTimeOffset.Now);
            return DateTimeOffset.Now;
        }
    }

    public async Task SetBackupReminderAsync(bool showReminder)
    {
        await preferenceStore.SetItemAsync("backupReminder", showReminder.ToString());
    }

    public async Task<bool> GetBackupReminderAsync()
    {
        return await preferenceStore.GetItemAsync("backupReminder") is "True" or null;
    }

    public async Task SetSplitWeightByDefaultAsync(bool splitWeightByDefault)
    {
        await preferenceStore.SetItemAsync("splitWeightByDefault", splitWeightByDefault.ToString());
    }

    public async Task<bool> GetSplitWeightByDefaultAsync()
    {
        return await preferenceStore.GetItemAsync("splitWeightByDefault") is "True";
    }

    public async Task SetFirstDayOfWeekAsync(DayOfWeek firstDayOfWeek)
    {
        await preferenceStore.SetItemAsync("firstDayOfWeek", firstDayOfWeek.ToString());
    }

    public async Task<DayOfWeek> GetFirstDayOfWeekAsync()
    {
        var firstDayOfWeek = await preferenceStore.GetItemAsync("firstDayOfWeek");
        if (Enum.TryParse<DayOfWeek>(firstDayOfWeek, out var dayOfWeek))
            return dayOfWeek;
        else
            return System.Globalization.CultureInfo.CurrentCulture.DateTimeFormat.FirstDayOfWeek;
    }
}
