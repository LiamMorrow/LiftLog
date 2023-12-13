using LiftLog.Lib.Models;
using LiftLog.Ui.Services;

namespace LiftLog.Web.Services;

public class WebAppPurchaseService(string webAuthKey) : IAppPurchaseService
{
    public Task<string?> GetProKeyAsync()
    {
        return Task.FromResult<string?>(webAuthKey);
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
