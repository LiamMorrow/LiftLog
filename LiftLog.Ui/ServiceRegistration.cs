using Fluxor;
using LiftLog.Lib.Serialization;
using LiftLog.Lib.Services;
using LiftLog.Ui.Repository;
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
        TEncryptionService
    >(this IServiceCollection services)
        where TKeyValueStore : class, IKeyValueStore
        where TPreferenceStore : class, IPreferenceStore
        where TNotificationService : class, INotificationService
        where TExporter : class, IExporter
        where TThemeProvider : class, IThemeProvider
        where TStringSharer : class, IStringSharer
        where TPurchaseService : class, IAppPurchaseService
        where TEncryptionService : class, IEncryptionService
    {
        services.AddFluxor(
            o =>
                o.ScanAssemblies(typeof(CurrentSessionReducers).Assembly)
                    .AddMiddleware<PersistSessionMiddleware>()
                    .AddMiddleware<PersistProgramMiddleware>()
                    .AddMiddleware<AppStateInitMiddleware>()
                    .AddMiddleware<SettingsStateInitMiddleware>()
                    .AddMiddleware<FeedStateInitMiddleware>()
#if DEBUG
                    .UseReduxDevTools(options =>
                    {
                        options.UseSystemTextJson(_ => JsonSerializerSettings.LiftLog);
                    })
#endif
        );

        services.AddScoped<ICurrentProgramRepository, KeyValueCurrentProgramRepository>();
        services.AddScoped<IProgressRepository, KeyValueProgressRepository>();
        services.AddScoped<PreferencesRepository>();

        services.AddScoped<
            BlazorTransitionableRoute.IRouteTransitionInvoker,
            BlazorTransitionableRoute.DefaultRouteTransitionInvoker
        >();

        services.AddScoped<IKeyValueStore, TKeyValueStore>();
        services.AddScoped<IPreferenceStore, TPreferenceStore>();
        services.AddScoped<INotificationService, TNotificationService>();
        services.AddScoped<IExporter, TExporter>();

        services.AddScoped<IAiWorkoutPlanner, ApiBasedAiWorkoutPlanner>();

        services.AddScoped<SessionService>();

        services.AddScoped<IThemeProvider, TThemeProvider>();

        services.AddScoped<IStringSharer, TStringSharer>();

        services.AddScoped<IAppPurchaseService, TPurchaseService>();

        services.AddScoped<IEncryptionService, TEncryptionService>();

        services.AddScoped<FeedApiService>();

        services.AddSingleton<InsetsManager>();

        return services;
    }
}
