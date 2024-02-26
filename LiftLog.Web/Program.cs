using System.Text.Json;
using Append.Blazor.Notifications;
using BlazorDownloadFile;
using Blazored.LocalStorage;
using Fluxor;
using LiftLog.Lib.Serialization;
using LiftLog.Lib.Services;
using LiftLog.Ui;
using LiftLog.Ui.Services;
using LiftLog.Ui.Store.App;
using LiftLog.Ui.Store.CurrentSession;
using LiftLog.Ui.Store.Feed;
using LiftLog.Ui.Store.Program;
using LiftLog.Ui.Store.Settings;
using LiftLog.Web.Services;
using Microsoft.AspNetCore.Components.WebAssembly.Hosting;
using INotificationService = LiftLog.Ui.Services.INotificationService;

var builder = WebAssemblyHostBuilder.CreateDefault(args);
builder.RootComponents.Add<ThemedWebApplication>("#app");
builder.Services.AddScoped(_ => new HttpClient
{
    BaseAddress = new Uri(builder.HostEnvironment.BaseAddress)
});

builder.Services.AddBlazoredLocalStorage();

builder.Services.AddNotifications();

builder.Services.AddBlazorDownloadFile();

builder.Services.AddSingleton(svc => new WebAppPurchaseServiceConfiguration(
    svc.GetRequiredService<IConfiguration>().GetValue<string>("WebAuthApiKey")
        ?? throw new Exception("WebAuthApiKey configuration is not set.")
));

builder.Services.RegisterUiServices<
    LocalStorageKeyValueStore,
    LocalStorageKeyValueStore,
    WebNotificationService,
    WebExporter,
    WebThemeProvider,
    ClipboardStringSharer,
    WebAppPurchaseService,
    JsEncryptionService
>();

#if DEBUG
builder.Services.AddSingleton<
    LiftLog.Ui.Pages.Screenshot.IScreenshotStatsImportsProvider,
    WebScreenshotStatsImportsProvider
>();
#endif

await builder.Build().RunAsync();
