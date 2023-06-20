using Append.Blazor.Notifications;
using BlazorDownloadFile;
using Microsoft.AspNetCore.Components.WebAssembly.Hosting;
using Fluxor;
using LiftLog.Lib.Store;
using Blazored.LocalStorage;
using LiftLog.Ui;
using LiftLog.Ui.Services;
using LiftLog.Ui.Store.CurrentSession;
using LiftLog.Ui.Store.Program;
using LiftLog.WebUi.Services;
using INotificationService = LiftLog.Lib.Services.INotificationService;
using LiftLog.Backend.Services;

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
            .UseReduxDevTools()
);

builder.Services.AddScoped<IKeyValueStore, LocalStorageKeyValueStore>();
builder.Services.AddScoped<IProgressStore, KeyValueProgressStore>();
builder.Services.AddScoped<IProgramStore, KeyValueProgramStore>();
builder.Services.AddScoped<SessionService>();

builder.Services.RegisterGptAiWorkoutPlanner("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");

builder.Services.AddSingleton<IThemeProvider, WebThemeProvider>();

builder.Services.AddNotifications();

builder.Services.AddBlazorDownloadFile();
builder.Services.AddScoped<ITextExporter, WebClipboardTextExporter>();
builder.Services.AddScoped<INotificationService, WebNotificationService>();
await builder.Build().RunAsync();
