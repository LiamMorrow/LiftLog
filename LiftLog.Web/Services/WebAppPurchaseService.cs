using LiftLog.Lib.Models;
using LiftLog.Ui.Services;

namespace LiftLog.Web.Services;

public record WebAppPurchaseServiceConfiguration(string WebAuthKey);

public class WebAppPurchaseService(WebAppPurchaseServiceConfiguration configuration)
    : IAppPurchaseService
{
    public Task<string?> GetProKeyAsync()
    {
        return Task.FromResult<string?>(configuration.WebAuthKey);
    }

    public AppStore GetAppStore()
    {
        return AppStore.Web;
    }

    public async Task<Price> GetProPriceAsync()
    {
        await Task.Delay(4000);
        return new("USD", "$15.00");
    }
}
