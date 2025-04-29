using Fluxor;
using LiftLog.Lib.Services;
using LiftLog.Maui.Services;
using LiftLog.Ui;
using LiftLog.Ui.Services;
using LiftLog.Ui.Store.App;
using MaterialColorUtilities.Maui;
using Microsoft.AspNetCore.Components;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Maui.Controls.Hosting;
using Microsoft.Maui.Hosting;
using Microsoft.Maui.LifecycleEvents;
using Microsoft.Maui.Storage;
using Plugin.LocalNotification;
using Plugin.LocalNotification.AndroidOption;
using Plugin.Maui.AppRating;
using Sentry.Extensions.Logging;
using Sentry.Extensions.Logging.Extensions.DependencyInjection;
using INotificationService = LiftLog.Ui.Services.INotificationService;

namespace LiftLog.Maui;

public static class MauiProgram
{
    public static MauiApp CreateMauiApp()
    {
        var builder = MauiApp.CreateBuilder();
        builder
            .UseMauiApp<App>()
            .UseSentry(options =>
            {
                // The DSN is the only required setting.
                options.Dsn =
                    "https://94068122cc0e9b1bc7bf65b20bd88bfe@o4505937515249664.ingest.sentry.io/4505937523769344";

                options.Debug = false;

                options.TracesSampleRate = 1.0;
                options.CaptureFailedRequests = true;
            });

        builder.Services.AddMauiBlazorWebView();

        builder.UseLocalNotification(notificationBuilder =>
        {
            notificationBuilder.AddCategory(
                new NotificationCategory(NotificationCategoryType.Status)
                {
                    ActionList =
                    [
                        new NotificationAction(100)
                        {
                            Title = "Complete Set",
                            Android = { LaunchAppWhenTapped = false },
                        },
                    ],
                }
            );
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
        builder.Services.AddSingleton<
            Ui.Pages.Screenshot.IScreenshotStatsImportsProvider,
            AppScreenshotStatsImportsProvider
        >();
#endif

        builder.Services.AddSingleton(new HttpClient());

        builder.Services.AddSingleton(Share.Default);
        builder.Services.AddSingleton(FilePicker.Default);
        builder.Services.AddSingleton(HapticFeedback.Default);
        builder.Services.AddSingleton(AppRating.Default!);

        builder.Services.RegisterUiServices<
            AppDataFileStorageKeyValueStore,
            FilePreferenceStore,
            MauiNotificationService,
            MauiBackupRestoreService,
            AppThemeProvider,
            MauiStringSharer,
            AppPurchaseService,
            OsEncryptionService,
            AppHapticFeedbackService,
            AppDeviceService,
            AppBuiltInExerciseLoader,
            MauiFileExportService
        >(typeof(ThemeEffects).Assembly);

        builder.UseMaterialColors<AppColorService>(opts =>
        {
            opts.FallbackSeed = 0x00FF00;
            opts.EnableDynamicColor = Preferences.Default.Get("EnableDynamicColor", true);
        });

        builder.ConfigureLifecycleEvents(lifecycle =>
        {
#if IOS || MACCATALYST
            lifecycle.AddiOS(ios =>
            {
                ios.FinishedLaunching((app, data) => HandleAppLink(app.UserActivity));

                ios.ContinueUserActivity(
                    (app, userActivity, handler) => HandleAppLink(userActivity)
                );

                ios.OpenUrl(
                    (app, url, options) =>
                    {
                        HandleLink(url.AbsoluteString);
                        return true;
                    }
                );
            });
#elif ANDROID
            lifecycle.AddAndroid(android =>
            {
                android.OnNewIntent(
                    (activity, bundle) =>
                    {
                        HandleIntent(bundle);
                    }
                );
                android.OnCreate(
                    (activity, bundle) =>
                    {
                        HandleIntent(activity.Intent);
                    }
                );
            });
#endif
        });

        return builder.Build();
    }

#if ANDROID
    private static void HandleIntent(Android.Content.Intent? intent)
    {
        var data = intent?.Data?.ToString();
        if (data is not null)
        {
            HandleLink(data);
        }
    }
#endif

#if IOS || MACCATALYST
    private static bool HandleAppLink(Foundation.NSUserActivity? activity)
    {
        if (activity is null)
        {
            return true;
        }

        var url = activity.WebPageUrl;
        if (url is null)
        {
            return true;
        }
        HandleLink(url.AbsoluteString);
        return true;
    }
#endif

    private static void HandleLink(string? link)
    {
        if (link is null)
        {
            return;
        }

        if (!Uri.TryCreate(link, UriKind.Absolute, out var uri))
        {
            return;
        }

        var path = uri.AbsolutePath;
        var query = uri.Query;
        MainThread.BeginInvokeOnMainThread(() =>
        {
            Application
                .Current?.Handler.MauiContext?.Services.GetRequiredService<Fluxor.IDispatcher>()
                .Dispatch(new NavigateAction(path + query));
        });
    }
}
