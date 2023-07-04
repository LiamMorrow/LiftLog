using Android.Renderscripts;
using Fluxor;
using Microsoft.Extensions.Logging;
using LiftLog.App.Services;
using LiftLog.Lib.Store;
using LiftLog.Ui.Services;
using LiftLog.Ui.Store.CurrentSession;
using LiftLog.Ui.Store.Program;
using MaterialColorUtilities.Maui;
using Plugin.LocalNotification;
using Plugin.LocalNotification.AndroidOption;
using INotificationService = LiftLog.Lib.Services.INotificationService;
using LiftLog.Lib.Services;

namespace LiftLog.App;

public static class MauiProgram
{
    public static MauiApp CreateMauiApp()
    {
        var builder = MauiApp.CreateBuilder();
        builder
            .UseMauiApp<App>()
            .ConfigureFonts(fonts =>
            {
                fonts.AddFont("OpenSans-Regular.ttf", "OpenSansRegular");
            });

        builder.Services.AddMauiBlazorWebView();

        builder.UseLocalNotification(notificationBuilder =>
        {
            notificationBuilder.AddAndroid(android =>
            {
                android.AddChannel(
                    new NotificationChannelRequest()
                    {
                        Id = MauiNotificationService.NextSetNotificationChannelId,
                        Description =
                            "Notifications which remind you when your next set should be started",
                        Importance = AndroidImportance.High,
                        Name = "Set Timers",
                        EnableSound = true,
                        EnableVibration = true,
                        ShowBadge = true,
                        LockScreenVisibility = AndroidVisibilityType.Public,
                        CanBypassDnd = false
                    }
                );
            });
        });

#if DEBUG
        builder.Services.AddBlazorWebViewDeveloperTools();
        builder.Logging.AddDebug();
#endif
        builder.Services.AddFluxor(
            o =>
                o.ScanAssemblies(typeof(Program).Assembly)
                    .AddMiddleware<PersistSessionMiddleware>()
                    .AddMiddleware<PersistProgramMiddleware>()
                    .UseReduxDevTools()
        );

        builder.Services.AddScoped<IProgramStore, KeyValueProgramStore>();
        builder.Services.AddScoped<IProgressStore, KeyValueProgressStore>();
        builder.Services.AddSingleton<IKeyValueStore, SecureStorageKeyValueStore>();
        builder.Services.AddSingleton<INotificationService, MauiNotificationService>();
        builder.Services.AddScoped<ITextExporter, MauiShareTextExporter>();

        builder.Services.AddSingleton<HttpClient>(new HttpClient());
        builder.Services.AddScoped<IAiWorkoutPlanner, ApiBasedAiWorkoutPlanner>();

        builder.Services.AddSingleton<IThemeProvider, AppThemeProvider>();

        builder.Services.AddSingleton(Share.Default);
        builder.Services.AddScoped<SessionService>();

        builder.UseMaterialColors<ThemeColorUpdateService>();
        return builder.Build();
    }
}
