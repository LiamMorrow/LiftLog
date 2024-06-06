using Fluxor;
using LiftLog.Lib.Serialization;
using LiftLog.Lib.Services;
using LiftLog.Ui.Services;
using LiftLog.Ui.Store.App;
using LiftLog.Ui.Store.CurrentSession;
using LiftLog.Ui.Store.Feed;
using LiftLog.Ui.Store.Program;
using LiftLog.Ui.Store.Settings;
using Microsoft.Extensions.DependencyInjection;

namespace LiftLog.Ui;

public static class ServiceRegistration
{
    public static IServiceCollection RegisterUiServices<
        TKeyValueStore,
        TPreferenceStore,
        TNotificationService,
        TExporter,
        TThemeProvider,
        TStringSharer,
        TPurchaseService,
        TEncryptionService,
        TVibrationService
    >(this IServiceCollection services)
        where TKeyValueStore : class, IKeyValueStore
        where TPreferenceStore : class, IPreferenceStore
        where TNotificationService : class, INotificationService
        where TExporter : class, IExporter
        where TThemeProvider : class, IThemeProvider
        where TStringSharer : class, IStringSharer
        where TPurchaseService : class, IAppPurchaseService
        where TEncryptionService : class, IEncryptionService
        where TVibrationService : class, IHapticFeedbackService
    {
        services.AddFluxor(o =>
            o.ScanAssemblies(typeof(CurrentSessionReducers).Assembly)
                .WithLifetime(StoreLifetime.Singleton)
                .AddMiddleware<PersistSessionMiddleware>()
                .AddMiddleware<PersistProgramMiddleware>()
                .AddMiddleware<AppStateInitMiddleware>()
                .AddMiddleware<SettingsStateInitMiddleware>()
                .AddMiddleware<FeedStateInitMiddleware>()
#if DEBUG
        // .UseReduxDevTools(options =>
        // {
        //     options.UseSystemTextJson(_ => JsonSerializerSettings.LiftLog);
        // })
#endif
        );

        services.AddSingleton<NavigationManagerProvider>();

        services.AddSingleton<CurrentProgramRepository>();
        services.AddSingleton<SavedProgramRepository>();
        services.AddSingleton<ProgressRepository>();
        services.AddSingleton<PreferencesRepository>();

        services.AddSingleton<
            BlazorTransitionableRoute.IRouteTransitionInvoker,
            BlazorTransitionableRoute.DefaultRouteTransitionInvoker
        >();

        services.AddSingleton<IKeyValueStore, TKeyValueStore>();
        services.AddSingleton<IPreferenceStore, TPreferenceStore>();
        services.AddSingleton<INotificationService, TNotificationService>();
        services.AddSingleton<IExporter, TExporter>();

        services.AddSingleton<IAiWorkoutPlanner, ApiBasedAiWorkoutPlanner>();

        services.AddSingleton<SessionService>();

        services.AddSingleton<IThemeProvider, TThemeProvider>();

        services.AddSingleton<IStringSharer, TStringSharer>();

        services.AddSingleton<IAppPurchaseService, TPurchaseService>();

        services.AddSingleton<IEncryptionService, TEncryptionService>();

        services.AddSingleton<IHapticFeedbackService, TVibrationService>();

        services.AddSingleton<FeedApiService>();
        services.AddSingleton<FeedIdentityService>();
        services.AddSingleton<FeedFollowService>();

        services.AddSingleton<NavigationManagerProvider>();

        services.AddSingleton<InsetsManager>();

        return services;
    }
}
