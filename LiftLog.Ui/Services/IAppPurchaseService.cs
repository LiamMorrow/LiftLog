using LiftLog.Lib.Models;

namespace LiftLog.Ui.Services;

public interface IAppPurchaseService
{
    Task<string?> GetProKeyAsync();

    AppStore GetAppStore();

    Task<Price> GetProPriceAsync();
}

public record Price(string Currency, string LocalizedPrice);
