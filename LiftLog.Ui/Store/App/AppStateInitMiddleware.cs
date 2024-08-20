using System.Diagnostics;
using Fluxor;
using LiftLog.Ui.Services;
using Microsoft.AspNetCore.Components;
using Microsoft.Extensions.Logging;

namespace LiftLog.Ui.Store.App;

public class AppStateInitMiddleware(
    PreferencesRepository preferencesRepository,
    IThemeProvider themeProvider,
    ILogger<AppStateInitMiddleware> logger
) : Middleware
{
    public override async Task InitializeAsync(IDispatcher dispatch, IStore store)
    {
        var sw = Stopwatch.StartNew();
        store
            .Features[nameof(AppFeature)]
            .RestoreState(
                (AppState)store.Features[nameof(AppFeature)].GetState() with
                {
                    ColorScheme = themeProvider.GetColorScheme(),
                }
            );
        var proToken = await preferencesRepository.GetProTokenAsync();
#if TEST_MODE
        await Task.Yield();
#else
        dispatch.Dispatch(new SetProTokenAction(proToken));
#endif

        var (appLaunchCount, addRatingResult) = await (
            preferencesRepository.GetAppOpenedCountAsync(),
            preferencesRepository.GetAppRatingResultAsync()
        );
        dispatch.Dispatch(new SetAppLaunchCountAction(appLaunchCount));
        dispatch.Dispatch(new SetAppRatingResultAction(addRatingResult));

        dispatch.Dispatch(new SetAppStateIsHydratedAction(true));
        sw.Stop();
        logger.LogInformation(
            "AppStateInitMiddleware took {ElapsedMilliseconds}ms",
            sw.ElapsedMilliseconds
        );
    }
}
