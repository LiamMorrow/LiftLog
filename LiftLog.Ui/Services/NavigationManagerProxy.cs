using Microsoft.AspNetCore.Components;

namespace LiftLog.Ui.Services;

/// <summary>
/// Sometimes we need the current navigation manager in a singleton service.
/// </summary>
public class NavigationManagerProvider
{
    private NavigationManager? navigationManager;
    private readonly TaskCompletionSource whenSet = new();

    public NavigationManagerProvider() { }

    public void SetNavigationManager(NavigationManager navigationManager)
    {
        this.navigationManager = navigationManager;
        whenSet.TrySetResult();
    }

    public async ValueTask<NavigationManager> GetNavigationManager()
    {
        if (navigationManager is not null)
        {
            return navigationManager;
        }

        await whenSet.Task;
        return navigationManager!;
    }
}
