using LiftLog.Lib.Models;
using LiftLog.Ui.Services;

namespace LiftLog.Web.Services;

public class WebAppPurchaseService : IAppPurchaseService
{
    private readonly string webProKey;

    public WebAppPurchaseService(string webAuthKey)
    {
        this.webProKey = webAuthKey;
    }

    public Task<string?> GetProKeyAsync()
    {
        return Task.FromResult<string?>(webProKey);
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
