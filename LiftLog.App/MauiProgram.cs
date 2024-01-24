using Fluxor;
using LiftLog.App.Services;
using LiftLog.Lib.Services;
using LiftLog.Ui;
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
using Sentry.Extensions.Logging.Extensions.DependencyInjection;
using INotificationService = LiftLog.Ui.Services.INotificationService;

namespace LiftLog.App;

public static class MauiProgram
{
    public static MauiApp CreateMauiApp()
    {
        var builder = MauiApp.CreateBuilder();
        builder.UseMauiApp<App>();

        builder.Services.AddMauiBlazorWebView();

        builder.UseLocalNotification(notificationBuilder =>
        {
            notificationBuilder.SetSerializer(new NotificationSerializer());
            notificationBuilder.AddCategory(
                new NotificationCategory(NotificationCategoryType.Status)
                {
                    ActionList =
                    [
                        new NotificationAction(100)
                        {
                            Title = "Complete Set",
                            Android = { LaunchAppWhenTapped = false, }
                        },
                    ]
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
#endif
        // Add this section anywhere on the builder:
        builder.Logging.AddSentry(options =>
        {
            // The DSN is the only required setting.
            options.Dsn =
                "https://94068122cc0e9b1bc7bf65b20bd88bfe@o4505937515249664.ingest.sentry.io/4505937523769344";

            options.Debug = false;

            // Set TracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
            // We recommend adjusting this value in production.
            options.TracesSampleRate = 0;
            options.EnableTracing = false;
            options.CaptureFailedRequests = true;

            // Other Sentry options can be set here.
        });

        builder.Services.AddSingleton(new HttpClient());

        builder.Services.AddSingleton(Share.Default);
        builder.Services.AddSingleton(FilePicker.Default);

        builder.Services.RegisterUiServices<
            AppDataFileStorageKeyValueStore,
            SecureStoragePreferenceStore,
            MauiNotificationService,
            MauiShareExporter,
            AppThemeProvider,
            MauiStringSharer,
            AppPurchaseService,
            OsEncryptionService
        >();

        builder.UseMaterialColors<ThemeColorUpdateService>(opts =>
        {
            opts.FallbackSeed = 0xF44336;
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
    private static async void HandleIntent(Android.Content.Intent? intent)
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
            _ = MainPage.NavigateWhenLoaded(path + query);
        });
    }
}
