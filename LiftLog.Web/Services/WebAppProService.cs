using LiftLog.Ui.Services;

namespace LiftLog.Web.Services;

public class WebAppProService : IAppPurchaseService
{

    public Task<string?> GetProKeyAsync()
    {
        return Task.FromResult<string?>("null");
    }
}
