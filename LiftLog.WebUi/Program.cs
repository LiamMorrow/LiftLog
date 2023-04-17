using Append.Blazor.Notifications;
using Microsoft.AspNetCore.Components.WebAssembly.Hosting;
using Fluxor;
using LiftLog.Lib.Store;
using LiftLog.WebUi.Store.CurrentSession;
using Blazored.LocalStorage;
using LiftLog.WebUi.Services;
using LiftLog.WebUi;
using LiftLog.WebUi.Store.Program;
using INotificationService = LiftLog.Lib.Services.INotificationService;

var builder = WebAssemblyHostBuilder.CreateDefault(args);
builder.RootComponents.Add<WebApplication>("#app");

builder.Services.AddScoped(
    sp => new HttpClient { BaseAddress = new Uri(builder.HostEnvironment.BaseAddress) }
);

builder.Services.AddBlazoredLocalStorage();

builder.Services.AddFluxor(
    o =>
        o.ScanAssemblies(typeof(Program).Assembly)
            .AddMiddleware<PersistSessionMiddleware>()
            .AddMiddleware<PersistProgramMiddleware>()
            .UseReduxDevTools()
);
builder.Services.AddScoped<IProgressStore, LocalStorageProgressStore>();
builder.Services.AddScoped<IProgramStore, LocalStorageProgramStore>();
builder.Services.AddScoped<SessionService>();

builder.Services.AddNotifications();
builder.Services.AddScoped<INotificationService, WebNotificationService>();

await builder.Build().RunAsync();
