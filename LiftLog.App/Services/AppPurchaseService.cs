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
        return DeviceInfo.Platform switch
        {
            var e when e == DevicePlatform.Android => AppStore.Google,
            var e when e == DevicePlatform.iOS => AppStore.Apple,
            _ => AppStore.Web
        };
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
            if (purchaseEx.PurchaseError == PurchaseError.UserCancelled)
            {
                return null;
            }
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
        catch (TaskCanceledException ex)
        {
            logger.LogWarning(ex, "Getting pro key cancelled");
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

    public async Task<Price> GetProPriceAsync()
    {
#if TEST_MODE
        if (GetAppStore() == AppStore.Web)
        {
            return new("USD", "0.99");
        }
#endif
        var billing = CrossInAppBilling.Current;
        try
        {
            var connected = await billing.ConnectAsync();
            if (!connected || !billing.CanMakePayments)
                return new("USD", "ERROR GETTING PRICE");

            var products = await billing.GetProductInfoAsync(
                ItemType.InAppPurchase,
                new[] { "pro" }
            );
            var proProduct = products.FirstOrDefault(p => p.ProductId == "pro");
            if (proProduct == null)
                return new("USD", "ERROR GETTING PRICE");

            return new("USD", proProduct.LocalizedPrice);
        }
        catch (TaskCanceledException ex)
        {
            logger.LogWarning(ex, "Getting price cancelled");
            return new("USD", "ERROR GETTING PRICE");
        }
        catch (Exception ex)
        {
            //Something else has gone wrong, log it
            logger.LogError(ex, "Error connecting");
            return new("USD", "ERROR GETTING PRICE");
        }
        finally
        {
            await billing.DisconnectAsync();
        }
    }
}
