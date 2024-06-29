using BlazorDownloadFile;
using Blazored.LocalStorage;
using LiftLog.Ui;
using LiftLog.Ui.Services;
using LiftLog.Web;
using LiftLog.Web.Services;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.WebAssembly.Hosting;

var builder = WebAssemblyHostBuilder.CreateDefault(args);
builder.RootComponents.Add<ThemedWebApplication>("#app");
builder.Services.AddSingleton(_ => new HttpClient
{
    BaseAddress = new Uri(builder.HostEnvironment.BaseAddress)
});

builder.Services.AddBlazoredLocalStorageAsSingleton();

builder.Services.AddBlazorDownloadFile(lifetime: ServiceLifetime.Singleton);

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
    JsEncryptionService,
    JsHapticFeedbackService,
    WebDeviceService
>();

#if DEBUG
builder.Services.AddSingleton<
    LiftLog.Ui.Pages.Screenshot.IScreenshotStatsImportsProvider,
    WebScreenshotStatsImportsProvider
>();
#endif

await builder.Build().RunAsync();
