using System.Runtime.InteropServices.JavaScript;
using LiftLog.Lib.Services;
using Microsoft.JSInterop;

namespace LiftLog.Web.Services;

// Dotnet AES-GCM implementation is not compatible with the JS implementation
public class JsEncryptionService(IJSRuntime jSRuntime) : IEncryptionService
{
    public ValueTask<byte[]> DecryptAesCbcAndVerifyRsa256PssAsync(
        AesEncryptedAndRsaSignedData data,
        AesKey key,
        RsaPublicKey publicKey
    )
    {
        return jSRuntime.InvokeAsync<byte[]>(
            "CryptoUtils.decryptAesCbcAndVerifyRsa256PssAsync",
            data,
            key,
            publicKey,
            IEncryptionService.RsaHashLength
        );
    }

    public ValueTask<AesEncryptedAndRsaSignedData> SignRsa256PssAndEncryptAesCbcAsync(
        byte[] data,
        AesKey key,
        RsaPrivateKey rsaPrivateKey,
        AesIV? iv = null
    )
    {
        return jSRuntime.InvokeAsync<AesEncryptedAndRsaSignedData>(
            "CryptoUtils.signRsa256PssAndEncryptAesCbcAsync",
            data,
            key,
            iv,
            IEncryptionService.RsaHashLength
        );
    }

    public ValueTask<AesKey> GenerateAesKeyAsync()
    {
        return jSRuntime.InvokeAsync<AesKey>("CryptoUtils.generateAesKey");
    }

    public ValueTask<RsaEncryptedData> EncryptRsaOaepSha256Async(
        byte[] data,
        RsaPublicKey publicKey
    )
    {
        return jSRuntime.InvokeAsync<RsaEncryptedData>(
            "CryptoUtils.encryptRsaOaepSha256Async",
            data,
            publicKey
        );
    }

    public ValueTask<byte[]> DecryptRsaOaepSha256Async(
        RsaEncryptedData data,
        RsaPrivateKey privateKey
    )
    {
        return jSRuntime.InvokeAsync<byte[]>(
            "CryptoUtils.decryptRsaOaepSha256Async",
            data,
            privateKey
        );
    }

    public ValueTask<RsaKeyPair> GenerateRsaKeysAsync()
    {
        return jSRuntime.InvokeAsync<RsaKeyPair>("CryptoUtils.generateRsaKeys");
    }
}
