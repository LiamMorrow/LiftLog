namespace LiftLog.Ui.Services;

public interface IKeyValueStore
{
    ValueTask<string?> GetItemAsync(string key);
    ValueTask<byte[]?> GetItemBytesAsync(string key);
    ValueTask SetItemAsync(string key, string value);
    ValueTask SetItemAsync(string key, byte[] value);
}
