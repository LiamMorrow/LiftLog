using Append.Blazor.Notifications;
using BlazorDownloadFile;
using Blazored.LocalStorage;
using LiftLog.Ui;
using LiftLog.Web.Services;
using Microsoft.AspNetCore.Components.WebAssembly.Hosting;

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

await builder.Build().RunAsync();
