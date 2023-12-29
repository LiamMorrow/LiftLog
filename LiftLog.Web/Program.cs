using System.Text.Json;
using Append.Blazor.Notifications;
using BlazorDownloadFile;
using Blazored.LocalStorage;
using Fluxor;
using LiftLog.Lib.Serialization;
using LiftLog.Lib.Services;
using LiftLog.Ui;
using LiftLog.Ui.Repository;
using LiftLog.Ui.Services;
using LiftLog.Ui.Store.App;
using LiftLog.Ui.Store.CurrentSession;
using LiftLog.Ui.Store.Program;
using LiftLog.Ui.Store.Settings;
using LiftLog.Web.Services;
using Microsoft.AspNetCore.Components.WebAssembly.Hosting;
using INotificationService = LiftLog.Ui.Services.INotificationService;

var builder = WebAssemblyHostBuilder.CreateDefault(args);
builder.RootComponents.Add<ThemedWebApplication>("#app");
builder.Services.AddScoped(
    _ => new HttpClient { BaseAddress = new Uri(builder.HostEnvironment.BaseAddress) }
);

builder.Services.AddBlazoredLocalStorage();

builder.Services.AddFluxor(
    o =>
        o.ScanAssemblies(typeof(Program).Assembly)
            .AddMiddleware<PersistSessionMiddleware>()
            .AddMiddleware<PersistProgramMiddleware>()
            .AddMiddleware<AppStateInitMiddleware>()
            .AddMiddleware<SettingsStateInitMiddleware>()
#if DEBUG
            .UseReduxDevTools(options =>
            {
                options.UseSystemTextJson(_ => JsonSerializerSettings.LiftLog);
            })
#endif
);

builder.Services.AddScoped<IKeyValueStore, LocalStorageKeyValueStore>();
builder.Services.AddScoped<IPreferenceStore, LocalStorageKeyValueStore>();

builder.Services.AddScoped<IProgressRepository, KeyValueProgressRepository>();
builder.Services.AddScoped<ICurrentProgramRepository, KeyValueCurrentProgramRepository>();
builder.Services.AddScoped<PreferencesRepository>();

builder.Services.AddScoped<SessionService>();

builder.Services.AddScoped<IAiWorkoutPlanner, ApiBasedAiWorkoutPlanner>();

builder.Services.AddScoped<IThemeProvider, WebThemeProvider>();

builder.Services.AddNotifications();

builder.Services.AddBlazorDownloadFile();
builder.Services.AddScoped<IExporter, WebExporter>();
builder.Services.AddScoped<INotificationService, WebNotificationService>();
builder.Services.AddScoped<
    BlazorTransitionableRoute.IRouteTransitionInvoker,
    BlazorTransitionableRoute.DefaultRouteTransitionInvoker
>();

builder.Services.AddScoped<IAppPurchaseService>(
    svc =>
        new WebAppPurchaseService(
            svc.GetRequiredService<IConfiguration>().GetValue<string>("WebAuthApiKey")
                ?? throw new Exception("WebAuthApiKey configuration is not set.")
        )
);

await builder.Build().RunAsync();
