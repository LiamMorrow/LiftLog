using LiftLog.Lib.Services;
using Microsoft.JSInterop;

namespace LiftLog.Web.Services;

// Dotnet AES-GCM implementation is not compatible with the JS implementation
public class JsAesEncryptionService(IJSRuntime jSRuntime) : IEncryptionService
{
    public ValueTask<byte[]> DecryptAsync(byte[] data, byte[] key, byte[] IV)
    {
        return jSRuntime.InvokeAsync<byte[]>("CryptoUtils.decrypt", data, key, IV);
    }

    public async ValueTask<(byte[] EncryptedPayload, byte[] IV)> EncryptAsync(
        byte[] data,
        byte[] key,
        byte[]? iv = null
    )
    {
        var result = await jSRuntime.InvokeAsync<EncryptResult>(
            "CryptoUtils.encrypt",
            data,
            key,
            iv
        );
        return (result.Encrypted, result.IV);
    }

    public ValueTask<byte[]> GenerateKeyAsync()
    {
        return jSRuntime.InvokeAsync<byte[]>("CryptoUtils.generateKey");
    }

    private record EncryptResult(byte[] Encrypted, byte[] IV);
}
