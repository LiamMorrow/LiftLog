using System.Diagnostics;
using LiftLog.Lib.Models;
using LiftLog.Ui.Services;
using Microsoft.Extensions.Logging;
using Plugin.InAppBilling;

namespace LiftLog.App.Services;

public class AppPurchaseService : IAppPurchaseService
{
    private readonly ILogger<AppPurchaseService> logger;

    public AppPurchaseService(ILogger<AppPurchaseService> logger)
    {
        this.logger = logger;
    }

    public AppStore GetAppStore()
    {
#if TEST_MODE
        return AppStore.Web;
#else
        return DeviceInfo.Platform switch
        {
            var e when e == DevicePlatform.Android => AppStore.Google,
            var e when e == DevicePlatform.iOS => AppStore.Apple,
            _ => AppStore.Web
        };
#endif
    }

    public async Task<string?> GetProKeyAsync()
    {
#if TEST_MODE
        if (GetAppStore() == AppStore.Web)
        {
            return "102bc25a-f46b-4423-9149-b0fa39b32f1e";
        }
#endif
        var billing = CrossInAppBilling.Current;
        try
        {
            var connected = await billing.ConnectAsync();
            if (!connected || !billing.CanMakePayments)
                return null;

            var purchase = await billing.PurchaseAsync("pro", ItemType.InAppPurchase);
            if (purchase == null)
                return null;
            else if (purchase.State == PurchaseState.Purchased)
            {
                // only need to finalize if on Android unless you turn off auto finalize on iOS
                await CrossInAppBilling.Current.FinalizePurchaseAsync(
                    purchase.TransactionIdentifier
                );
            }

            return purchase.PurchaseToken;
        }
        catch (InAppBillingPurchaseException purchaseEx)
        {
            if (purchaseEx.PurchaseError == PurchaseError.AlreadyOwned)
            {
                var purchases = await billing.GetPurchasesAsync(ItemType.InAppPurchase);
                var proPurchase = purchases.FirstOrDefault(p => p.ProductId == "pro");
                if (proPurchase?.State == PurchaseState.Purchased)
                {
                    return proPurchase.PurchaseToken;
                }
            }
            //Billing Exception handle this based on the type
            logger.LogError(purchaseEx, "Error purchasing pro");
            return null;
        }
        catch (Exception ex)
        {
            //Something else has gone wrong, log it
            logger.LogError(ex, "Error connecting");
            return null;
        }
        finally
        {
            await billing.DisconnectAsync();
        }
    }
}
