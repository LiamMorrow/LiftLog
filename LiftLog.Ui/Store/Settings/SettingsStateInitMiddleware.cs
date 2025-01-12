using Fluxor;
using LiftLog.Ui.Services;
using Microsoft.Extensions.Logging;

namespace LiftLog.Ui.Store.Settings;

public class SettingsStateInitMiddleware(
    PreferencesRepository preferencesRepository,
    ILogger<SettingsStateInitMiddleware> logger
) : Middleware
{
    public override async Task InitializeAsync(IDispatcher dispatch, IStore store)
    {
        try
        {
            var sw = System.Diagnostics.Stopwatch.StartNew();
            var (
                useImperialUnits,
                showBodyweight,
                showTips,
                tipToShow,
                showFeed,
                restNotifications,
                remoteBackupSettings,
                lastSuccessfulRemoteBackupHash,
                lastBackupTime,
                backupReminder,
                splitWeightByDefault
            ) = await (
                preferencesRepository.GetUseImperialUnitsAsync(),
                preferencesRepository.GetShowBodyweightAsync(),
                preferencesRepository.GetShowTipsAsync(),
                preferencesRepository.GetTipToShowAsync(),
                preferencesRepository.GetShowFeedAsync(),
                preferencesRepository.GetRestNotificationsAsync(),
                preferencesRepository.GetRemoteBackupSettingsAsync(),
                preferencesRepository.GetLastSuccessfulRemoteBackupHashAsync(),
                preferencesRepository.GetLastBackupTimeAsync(),
                preferencesRepository.GetBackupReminderAsync(),
                preferencesRepository.GetSplitWeightByDefaultAsync()
            );

            var state = (SettingsState)store.Features[nameof(SettingsFeature)].GetState() with
            {
                IsHydrated = true,
                UseImperialUnits = useImperialUnits,
                ShowBodyweight = showBodyweight,
                ShowTips = showTips,
                TipToShow = tipToShow,
                ShowFeed = showFeed,
                RestNotifications = restNotifications,
                RemoteBackupSettings = remoteBackupSettings,
                LastSuccessfulRemoteBackupHash = lastSuccessfulRemoteBackupHash,
                LastBackupTime = lastBackupTime,
                BackupReminder = backupReminder,
                SplitWeightByDefault = splitWeightByDefault,
            };
            store.Features[nameof(SettingsFeature)].RestoreState(state);
            sw.Stop();
            logger.LogInformation(
                "Settings state initialized in {ElapsedMilliseconds}ms",
                sw.ElapsedMilliseconds
            );
        }
        catch (Exception e)
        {
            logger.LogError(e, "Failed to restore settings state");
            throw;
        }
    }
}
