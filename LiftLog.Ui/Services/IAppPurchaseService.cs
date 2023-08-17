namespace LiftLog.Ui.Services;


public interface IAppPurchaseService
{
    Task<string?> GetProKeyAsync();
}
