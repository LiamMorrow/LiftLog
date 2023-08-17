using LiftLog.Ui.Services;

namespace LiftLog.App.Services;

public class SecureStoragePreferenceStore : IPreferenceStore
{
    public async ValueTask<string?> GetItemAsync(string key)
    {
        return await SecureStorage.Default.GetAsync(key);
    }

    public async ValueTask SetItemAsync(string key, string value)
    {
        await SecureStorage.Default.SetAsync(key, value);
    }
}
