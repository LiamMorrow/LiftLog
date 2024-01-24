using LiftLog.Ui.Services;

namespace LiftLog.App.Services;

public class SecureStoragePreferenceStore
#if DEBUG_IOSSIM
(IKeyValueStore keyValueStore)
#endif
    : IPreferenceStore
{
    public async ValueTask<string?> GetItemAsync(string key)
    {
#if DEBUG_IOSSIM
        return await keyValueStore.GetItemAsync("SS" + key);
#else
        return await SecureStorage.Default.GetAsync(key);
#endif
    }

    public async ValueTask SetItemAsync(string key, string value)
    {
#if DEBUG_IOSSIM
        await keyValueStore.SetItemAsync("SS" + key, value);
#else
        await SecureStorage.Default.SetAsync(key, value);
#endif
    }
}
