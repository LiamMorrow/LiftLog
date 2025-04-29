using LiftLog.Ui.Services;

namespace LiftLog.Maui.Services;

// We are migrating to use file storage for all our store values for a while
public class FilePreferenceStore(IKeyValueStore keyValueStore) : IPreferenceStore
{
    public async ValueTask<string?> GetItemAsync(string key)
    {
        var fileValue = await keyValueStore.GetItemAsync(key);
        if (fileValue is null)
        {
            var oldVal = await SecureStorage.Default.GetAsync(key);
            if (oldVal is not null)
            {
                await SetItemAsync(key, oldVal);
            }
            return oldVal;
        }
        return fileValue;
    }

    public async ValueTask SetItemAsync(string key, string value)
    {
        await keyValueStore.SetItemAsync(key, value);
    }
}
