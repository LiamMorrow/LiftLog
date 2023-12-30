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

    public ValueTask<(byte[] EncryptedPayload, byte[] IV)> EncryptAsync(
        byte[] data,
        byte[] key,
        byte[]? iv = null
    )
    {
        return jSRuntime.InvokeAsync<(byte[], byte[])>("CryptoUtils.encrypt", data, key, iv);
    }

    public ValueTask<byte[]> GenerateKeyAsync()
    {
        return jSRuntime.InvokeAsync<byte[]>("CryptoUtils.generateKey");
    }
}
