using System.Diagnostics;
using LiftLog.Lib.Models;
using LiftLog.Ui.Services;
using Plugin.InAppBilling;

namespace LiftLog.App.Services;

public class AppPurchaseService : IAppPurchaseService
{
    public AppStore GetAppStore()
    {
        var platform = DeviceInfo.Platform;
        if (platform == DevicePlatform.Android)
            return AppStore.Google;
        else if (platform == DevicePlatform.iOS)
            return AppStore.Web;
        else
            return AppStore.Web;
    }

    public async Task<string?> GetProKeyAsync()
    {
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
            Console.WriteLine("Error: " + purchaseEx);
            return null;
        }
        catch (Exception ex)
        {
            //Something else has gone wrong, log it
            Console.WriteLine("Issue connecting: " + ex);
            return null;
        }
        finally
        {
            await billing.DisconnectAsync();
        }
    }
}
