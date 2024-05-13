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
            var useImperialUnits = await preferencesRepository.GetUseImperialUnitsAsync();
            dispatch.Dispatch(new SetUseImperialUnitsAction(useImperialUnits));
            var showBodyweight = await preferencesRepository.GetShowBodyweightAsync();
            dispatch.Dispatch(new SetShowBodyweightAction(showBodyweight));
            var showTips = await preferencesRepository.GetShowTipsAsync();
            dispatch.Dispatch(new SetShowTipsAction(showTips));
            var tipToShow = await preferencesRepository.GetTipToShowAsync();
            dispatch.Dispatch(new SetTipToShowAction(tipToShow));
            var showFeed = await preferencesRepository.GetShowFeedAsync();
            dispatch.Dispatch(new SetShowFeedAction(showFeed));
            var statusBarFix = await preferencesRepository.GetStatusBarFixAsync();
            dispatch.Dispatch(new SetStatusBarFixAction(statusBarFix));
            dispatch.Dispatch(new SetSettingsIsHydratedAction());
        }
        catch (Exception e)
        {
            logger.LogError(e, "Failed to restore settings state");
            throw;
        }
    }
}
