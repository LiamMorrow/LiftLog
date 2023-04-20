using System.Text.Json;
using Android.Renderscripts;
using Fluxor;
using Microsoft.Extensions.Logging;
using LiftLog.App.Services;
using LiftLog.Lib.Services;
using LiftLog.Lib.Store;
using LiftLog.Ui.Services;
using LiftLog.Ui.Store.CurrentSession;
using LiftLog.Ui.Store.Program;
using LiftLog.Ui.Util;
using LiftLog.WebUi.Services;

namespace LiftLog.App;

public static class MauiProgram
{
    public static MauiApp CreateMauiApp()
    {
        var builder = MauiApp.CreateBuilder();
        builder
            .UseMauiApp<App>()
            .ConfigureFonts(fonts => { fonts.AddFont("OpenSans-Regular.ttf", "OpenSansRegular"); });

        builder.Services.AddScoped<IProgramStore, KeyValueProgramStore>();
        builder.Services.AddScoped<IProgressStore, KeyValueProgressStore>();
        builder.Services.AddSingleton<IKeyValueStore, SecureStorageKeyValueStore>();
        builder.Services.AddScoped<INotificationService, WebNotificationService>();
        builder.Services.AddScoped<SessionService>();
        builder.Services.AddMauiBlazorWebView();
        

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


        return builder.Build();
    }
}