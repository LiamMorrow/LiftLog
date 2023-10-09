namespace LiftLog.Ui.Services;

public class ProTokenRepository
{
    private readonly IPreferenceStore preferenceStore;

    public ProTokenRepository(IPreferenceStore preferenceStore)
    {
        this.preferenceStore = preferenceStore;
    }

    public async Task<string?> GetProTokenAsync()
    {
#if TEST_MODE
        await Task.Yield();
        return null;
#else
        var token = await preferenceStore.GetItemAsync("proToken");
        if (Guid.TryParse(token, out var _))
            return null;
        else
            return token;
#endif
    }

    public async Task SetProTokenAsync(string? token)
    {
        if (token is not null)
            await preferenceStore.SetItemAsync("proToken", token);
    }
}
