using System.Reflection;
using Fluxor;
using Fluxor.DependencyInjection;
using LiftLog.Lib.Serialization;
using LiftLog.Lib.Services;
using LiftLog.Ui.Services;
using LiftLog.Ui.Store.App;
using LiftLog.Ui.Store.CurrentSession;
using LiftLog.Ui.Store.Feed;
using LiftLog.Ui.Store.Program;
using LiftLog.Ui.Store.Settings;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
#if DEBUG
using Fluxor.Blazor.Web.ReduxDevTools;
#endif

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
        TVibrationService,
        TDeviceService,
        TBuiltInExerciseService
    >(this IServiceCollection services, Assembly fluxorScanAssembly)
        where TKeyValueStore : class, IKeyValueStore
        where TPreferenceStore : class, IPreferenceStore
        where TNotificationService : class, INotificationService
        where TExporter : class, IExporter
        where TThemeProvider : class, IThemeProvider
        where TStringSharer : class, IStringSharer
        where TPurchaseService : class, IAppPurchaseService
        where TEncryptionService : class, IEncryptionService
        where TVibrationService : class, IHapticFeedbackService
        where TDeviceService : class, IDeviceService
        where TBuiltInExerciseService : class, IBuiltInExerciseLoader
    {
        var lifetime = ServiceLifetime.Singleton;
        services.AddFluxor(o =>
            o.ScanAssemblies(typeof(CurrentSessionReducers).Assembly, fluxorScanAssembly)
                .WithLifetime(
                    lifetime == ServiceLifetime.Singleton
                        ? StoreLifetime.Singleton
                        : StoreLifetime.Scoped
                )
                .AddMiddleware<PersistSessionMiddleware>()
                .AddMiddleware<PersistProgramMiddleware>()
                .AddMiddleware<AppStateInitMiddleware>()
                .AddMiddleware<SettingsStateInitMiddleware>()
                .AddMiddleware<FeedStateInitMiddleware>()
#if DEBUG
        // .UseReduxDevTools()  // Fails to load
#endif
        );

        services.Add<CurrentProgramRepository>(lifetime);
        services.Add<ProgressRepository>(lifetime);
        services.Add<PreferencesRepository>(lifetime);
        services.Add<NavigationManagerProvider>(lifetime);

        services.Add<
            BlazorTransitionableRoute.IRouteTransitionInvoker,
            BlazorTransitionableRoute.DefaultRouteTransitionInvoker
        >(lifetime);

        services.Add<CurrentProgramRepository>(lifetime);
        services.Add<SavedProgramRepository>(lifetime);
        services.Add<ProgressRepository>(lifetime);
        services.Add<PreferencesRepository>(lifetime);

        services.Add<IKeyValueStore, TKeyValueStore>(lifetime);
        services.Add<IPreferenceStore, TPreferenceStore>(lifetime);
        services.Add<INotificationService, TNotificationService>(lifetime);
        services.Add<IExporter, TExporter>(lifetime);

        services.Add<IAiWorkoutPlanner, ApiBasedAiWorkoutPlanner>(lifetime);

        services.Add<SessionService>(lifetime);

        services.Add<IThemeProvider, TThemeProvider>(lifetime);

        services.Add<IStringSharer, TStringSharer>(lifetime);

        services.Add<IAppPurchaseService, TPurchaseService>(lifetime);

        services.Add<IEncryptionService, TEncryptionService>(lifetime);

        services.Add<IHapticFeedbackService, TVibrationService>(lifetime);

        services.Add<IBuiltInExerciseLoader, TBuiltInExerciseService>(lifetime);

        services.Add<FeedApiService>(lifetime);
        services.Add<FeedIdentityService>(lifetime);
        services.Add<FeedFollowService>(lifetime);

        services.Add<NavigationManagerProvider>(lifetime);

        services.Add<IDeviceService, TDeviceService>(lifetime);
        services.Add<ToastService>(lifetime);

        services.Add<InsetsManager>(lifetime);

        return services;
    }

    private static void Add<T, TImplementation>(
        this IServiceCollection services,
        ServiceLifetime lifetime
    )
        where T : class
        where TImplementation : class, T
    {
        services.Add(new ServiceDescriptor(typeof(T), typeof(TImplementation), lifetime));
    }

    private static void Add<T>(this IServiceCollection services, ServiceLifetime lifetime)
        where T : class
    {
        services.Add(new ServiceDescriptor(typeof(T), typeof(T), lifetime));
    }
}
