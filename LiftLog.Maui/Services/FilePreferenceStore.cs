using LiftLog.Ui.Services;

namespace LiftLog.Maui.Services;

public class FilePreferenceStore(IKeyValueStore keyValueStore) : IPreferenceStore
{
    public async ValueTask<string?> GetItemAsync(string key)
    {
        var fileValue = await keyValueStore.GetItemAsync(key);
        if (fileValue is null)
        {
            return await SecureStorage.Default.GetAsync(key);
        }
        return fileValue;
    }

    public async ValueTask SetItemAsync(string key, string value)
    {
        await keyValueStore.SetItemAsync(key, value);
    }
}
