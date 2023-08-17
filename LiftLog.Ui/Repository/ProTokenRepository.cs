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
        return await preferenceStore.GetItemAsync("proToken");
    }

    public async Task SetProTokenAsync(string token)
    {
        await preferenceStore.SetItemAsync("proToken", token);
    }

}
