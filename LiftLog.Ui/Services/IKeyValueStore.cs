namespace LiftLog.Ui.Services;

public interface IKeyValueStore
{
    ValueTask<string?> GetItemAsync(string key);
    ValueTask SetItemAsync(string key, string value);
}