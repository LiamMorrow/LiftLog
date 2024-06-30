using Fluxor;
using LiftLog.Ui.Services;
using Microsoft.AspNetCore.Components;
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
            var (
                useImperialUnits,
                showBodyweight,
                showTips,
                tipToShow,
                showFeed,
                statusBarFix,
                restNotifications
            ) = await (
                preferencesRepository.GetUseImperialUnitsAsync(),
                preferencesRepository.GetShowBodyweightAsync(),
                preferencesRepository.GetShowTipsAsync(),
                preferencesRepository.GetTipToShowAsync(),
                preferencesRepository.GetShowFeedAsync(),
                preferencesRepository.GetStatusBarFixAsync(),
                preferencesRepository.GetRestNotificationsAsync()
            );
            dispatch.Dispatch(new SetUseImperialUnitsAction(useImperialUnits));
            dispatch.Dispatch(new SetShowBodyweightAction(showBodyweight));
            dispatch.Dispatch(new SetShowTipsAction(showTips));
            dispatch.Dispatch(new SetTipToShowAction(tipToShow));
            dispatch.Dispatch(new SetShowFeedAction(showFeed));
            dispatch.Dispatch(new SetStatusBarFixAction(statusBarFix));
            dispatch.Dispatch(new SetRestNotificationsAction(restNotifications));

            dispatch.Dispatch(new SetSettingsIsHydratedAction());
        }
        catch (Exception e)
        {
            logger.LogError(e, "Failed to restore settings state");
            throw;
        }
    }
}
