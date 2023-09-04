using Android.Renderscripts;
using Fluxor;
using Microsoft.Extensions.Logging;
using LiftLog.App.Services;
using LiftLog.Ui.Repository;
using LiftLog.Ui.Services;
using LiftLog.Ui.Store.CurrentSession;
using LiftLog.Ui.Store.Program;
using MaterialColorUtilities.Maui;
using Plugin.LocalNotification;
using Plugin.LocalNotification.AndroidOption;
using INotificationService = LiftLog.Ui.Services.INotificationService;
using LiftLog.Lib.Services;
using LiftLog.Ui.Store.App;

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
            notificationBuilder.SetSerializer(new NotificationSerializer());
            notificationBuilder.AddCategory(new NotificationCategory(NotificationCategoryType.Status)
            {
                ActionList = new HashSet<NotificationAction>()
                {
                    new NotificationAction(100)
                    {
                        Title = "Complete Set",
                        Android =
                        {
                            LaunchAppWhenTapped = false,
                        }
                    },
                }
            });
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
                        CanBypassDnd = false,
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
                    .AddMiddleware<AppStateInitMiddleware>()
        );

        builder.Services.AddScoped<ICurrentProgramRepository, KeyValueCurrentProgramRepository>();
        builder.Services.AddScoped<IProgressRepository, KeyValueProgressRepository>();
        builder.Services.AddScoped<ProTokenRepository>();

        builder.Services.AddSingleton<IKeyValueStore, AppDataFileStorageKeyValueStore>();
        builder.Services.AddSingleton<IPreferenceStore, SecureStoragePreferenceStore>();
        builder.Services.AddScoped<INotificationService, MauiNotificationService>();
        builder.Services.AddScoped<ITextExporter, MauiShareTextExporter>();

        builder.Services.AddSingleton(new HttpClient());
        builder.Services.AddScoped<IAiWorkoutPlanner, ApiBasedAiWorkoutPlanner>();

        builder.Services.AddSingleton<AppThemeProvider>();
        builder.Services.AddSingleton<IThemeProvider>(sp => sp.GetRequiredService<AppThemeProvider>());

        builder.Services.AddSingleton(Share.Default);
        builder.Services.AddSingleton(FilePicker.Default);
        builder.Services.AddScoped<SessionService>();

        builder.Services.AddScoped<IAppPurchaseService, AppPurchaseService>();


        builder.UseMaterialColors<ThemeColorUpdateService>();
        return builder.Build();
    }
}
