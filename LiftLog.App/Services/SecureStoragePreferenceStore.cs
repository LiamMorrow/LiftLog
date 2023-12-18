using LiftLog.Ui.Services;

namespace LiftLog.App.Services;

public class SecureStoragePreferenceStore
#if IOS_SIMULATOR
(IKeyValueStore keyValueStore)
#endif
    : IPreferenceStore
{
    public async ValueTask<string?> GetItemAsync(string key)
    {
#if IOS_SIMULATOR
        return await keyValueStore.GetItemAsync("SS" + key);
#else
        return await SecureStorage.Default.GetAsync(key);
#endif
    }

    public async ValueTask SetItemAsync(string key, string value)
    {
#if IOS_SIMULATOR
        await keyValueStore.SetItemAsync("SS" + key, value);
#else
        await SecureStorage.Default.SetAsync(key, value);
#endif
    }
}
