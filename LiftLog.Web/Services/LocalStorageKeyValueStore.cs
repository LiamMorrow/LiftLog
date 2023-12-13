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

    public ValueTask SetItemAsync(string key, string value)
    {
        return localStorageService.SetItemAsStringAsync(key, value);
    }
}
