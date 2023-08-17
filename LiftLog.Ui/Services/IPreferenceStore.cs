namespace LiftLog.Ui.Services;

public interface IPreferenceStore
{
    ValueTask<string?> GetItemAsync(string key);
    ValueTask SetItemAsync(string key, string value);
}
