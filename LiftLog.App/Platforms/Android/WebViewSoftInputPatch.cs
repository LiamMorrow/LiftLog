using System.Runtime.Versioning;
using Android.Content.Res;
using Android.Views;
using Android.Widget;
using static Android.Resource;
using Activity = Android.App.Activity;
using Rect = Android.Graphics.Rect;
using View = Android.Views.View;

namespace LiftLog.App;

[SupportedOSPlatform("Android")]
public static class WebViewSoftInputPatch
{
    static Activity Activity =>
        Microsoft.Maui.ApplicationModel.Platform.CurrentActivity
        ?? throw new InvalidOperationException("Android Activity can't be null.");
    static View MChildOfContent;
    static FrameLayout.LayoutParams FrameLayoutParams;
    static int UsableHeightPrevious = 0;

    public static void Initialize()
    {
        FrameLayout content = (FrameLayout)Activity.FindViewById(Id.Content);
        MChildOfContent = content.GetChildAt(0);
        MChildOfContent.ViewTreeObserver.GlobalLayout += (s, o) => PossiblyResizeChildOfContent();
        FrameLayoutParams = (FrameLayout.LayoutParams)MChildOfContent?.LayoutParameters;
    }

    static void PossiblyResizeChildOfContent()
    {
        int usableHeightNow = ComputeUsableHeight();
        if (usableHeightNow != UsableHeightPrevious)
        {
            int usableHeightSansKeyboard = MChildOfContent.RootView.Height;
            int heightDifference = usableHeightSansKeyboard - usableHeightNow;
            if (heightDifference < 0)
            {
                usableHeightSansKeyboard = MChildOfContent.RootView.Width;
                heightDifference = usableHeightSansKeyboard - usableHeightNow;
            }

            if (heightDifference > usableHeightSansKeyboard / 4)
            {
                FrameLayoutParams.Height = usableHeightSansKeyboard - heightDifference;
            }
            else
            {
                FrameLayoutParams.Height = usableHeightNow;
            }
        }

        MChildOfContent.RequestLayout();
        UsableHeightPrevious = usableHeightNow;
    }

    static int ComputeUsableHeight()
    {
        Rect rect = new Rect();
        MChildOfContent.GetWindowVisibleDisplayFrame(rect);
        return rect.Bottom + GetNavBarHeight();
    }

    public static int GetNavBarHeight()
    {
        int result = 0;
        Resources resources = Activity.Resources;
        int resourceId = resources.GetIdentifier("navigation_bar_height", "dimen", "android");
        if (resourceId > 0)
        {
            result = resources.GetDimensionPixelSize(resourceId);
        }
        return result;
    }

    public static int GetStatusBarHeight()
    {
        int result = 0;
        int resourceId = Activity.Resources.GetIdentifier("status_bar_height", "dimen", "android");
        if (resourceId > 0)
        {
            result = Activity.Resources.GetDimensionPixelSize(resourceId);
        }
        return result;
    }
}
