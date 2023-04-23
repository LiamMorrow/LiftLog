using Blazored.LocalStorage;
using LiftLog.Ui.Services;

namespace LiftLog.WebUi.Services;

public class LocalStorageKeyValueStore : IKeyValueStore
{
    private readonly ILocalStorageService _localStorageService;

    public LocalStorageKeyValueStore(ILocalStorageService localStorageService)
    {
        _localStorageService = localStorageService;
    }

    public ValueTask<string?> GetItemAsync(string key)
    {
        return _localStorageService.GetItemAsStringAsync(key);
    }

    public ValueTask SetItemAsync(string key, string value)
    {
        return _localStorageService.SetItemAsStringAsync(key, value);
    }
}
