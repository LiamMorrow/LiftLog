using LiftLog.Ui.Services;

namespace LiftLog.App.Services;

public class AppDataFileStorageKeyValueStore : IKeyValueStore
{
    public async ValueTask<string?> GetItemAsync(string key)
    {
        var fileName = GetFileName(key);
        var exists = File.Exists(fileName);
        if (exists)
        {
            var content = await File.ReadAllTextAsync(fileName);
            return content;
        }

        return null;
    }

    public async ValueTask<byte[]?> GetItemBytesAsync(string key)
    {
        var fileName = GetFileName(key);
        var exists = File.Exists(fileName);
        if (exists)
        {
            var content = await File.ReadAllBytesAsync(fileName);
            return content;
        }

        return null;
    }

    public async ValueTask SetItemAsync(string key, string value)
    {
        await File.WriteAllTextAsync(GetFileName(key), value);
    }

    public async ValueTask SetItemAsync(string key, byte[] value)
    {
        await File.WriteAllBytesAsync(GetFileName(key), value);
    }

    private string GetFileName(string key)
    {
        var dataDir = FileSystem.Current.AppDataDirectory;
        var fileName = Path.Combine(dataDir, key);
        return fileName;
    }
}
