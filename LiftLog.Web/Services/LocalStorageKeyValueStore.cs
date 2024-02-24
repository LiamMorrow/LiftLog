using Blazored.LocalStorage;
using LiftLog.Ui.Services;

namespace LiftLog.Web.Services;

public class LocalStorageKeyValueStore(ILocalStorageService localStorageService)
    : IKeyValueStore,
        IPreferenceStore
{
    public ValueTask<string?> GetItemAsync(string key)
    {
        return localStorageService.GetItemAsStringAsync(key);
    }

    public ValueTask<byte[]?> GetItemBytesAsync(string key)
    {
        return localStorageService.GetItemAsync<byte[]?>(key);
    }

    public ValueTask SetItemAsync(string key, string value)
    {
        return localStorageService.SetItemAsStringAsync(key, value);
    }

    public ValueTask SetItemAsync(string key, byte[] value)
    {
        return localStorageService.SetItemAsync(key, value);
    }

    public ValueTask RemoveItemAsync(string key)
    {
        return localStorageService.RemoveItemAsync(key);
    }
}
