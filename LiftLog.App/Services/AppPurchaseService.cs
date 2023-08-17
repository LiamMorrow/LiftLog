using System.Diagnostics;
using Plugin.InAppBilling;

namespace LiftLog.App.Services;

public class AppPurchaseService
{
    public async Task<bool> PurchaseAiPlanCreditsAsync(int credits)
    {
        var billing = CrossInAppBilling.Current;
        try
        {
            var connected = await billing.ConnectAsync();
            if (!connected || !billing.CanMakePayments)
                return false;

            var purchase = await billing.PurchaseAsync("ai_credit", ItemType.InAppPurchaseConsumable);
            if (purchase == null)
                return false;

            return true;
        }
        catch (InAppBillingPurchaseException purchaseEx)
        {
            //Billing Exception handle this based on the type
            Debug.WriteLine("Error: " + purchaseEx);
            return false;
        }
        catch (Exception ex)
        {
            //Something else has gone wrong, log it
            Debug.WriteLine("Issue connecting: " + ex);
            return false;
        }
        finally
        {
            await billing.DisconnectAsync();
        }
    }

}
