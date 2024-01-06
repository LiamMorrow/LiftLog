using LiftLog.Lib.Services;
using Microsoft.JSInterop;

namespace LiftLog.Web.Services;

// Dotnet AES-GCM implementation is not compatible with the JS implementation
public class JsEncryptionService(IJSRuntime jSRuntime) : IEncryptionService
{
    public ValueTask<byte[]> DecryptAesAsync(byte[] data, byte[] key, byte[] IV)
    {
        return jSRuntime.InvokeAsync<byte[]>("CryptoUtils.decryptAes", data, key, IV);
    }

    public async ValueTask<(byte[] EncryptedPayload, byte[] IV)> EncryptAesAsync(
        byte[] data,
        byte[] key,
        byte[]? iv = null
    )
    {
        var result = await jSRuntime.InvokeAsync<EncryptResult>(
            "CryptoUtils.encryptAes",
            data,
            key,
            iv
        );
        return (result.Encrypted, result.IV);
    }

    public ValueTask<byte[]> GenerateAesKeyAsync()
    {
        return jSRuntime.InvokeAsync<byte[]>("CryptoUtils.generateAesKey");
    }

    public ValueTask<byte[]> EncryptRsaAsync(byte[] data, byte[] publicKey)
    {
        return jSRuntime.InvokeAsync<byte[]>("CryptoUtils.encryptRsa", data, publicKey);
    }

    public ValueTask<byte[]> DecryptRsaAsync(byte[] data, byte[] privateKey)
    {
        return jSRuntime.InvokeAsync<byte[]>("CryptoUtils.decryptRsa", data, privateKey);
    }

    public async ValueTask<(byte[] PublicKey, byte[] PrivateKey)> GenerateRsaKeysAsync()
    {
        var keyPair = await jSRuntime.InvokeAsync<RsaKeyPair>("CryptoUtils.generateRsaKeys");
        return (keyPair.PublicKey, keyPair.PrivateKey);
    }

    private record EncryptResult(byte[] Encrypted, byte[] IV);

    private record RsaKeyPair(byte[] PublicKey, byte[] PrivateKey);
}
