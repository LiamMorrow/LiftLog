using System.Runtime.InteropServices.JavaScript;
using LiftLog.Lib.Services;
using Microsoft.JSInterop;

namespace LiftLog.Web.Services;

// Dotnet AES-GCM implementation is not compatible with the JS implementation
public class JsEncryptionService(IJSRuntime jSRuntime) : IEncryptionService
{
    public Task<byte[]> DecryptAesCbcAndVerifyRsa256PssAsync(
        AesEncryptedAndRsaSignedData data,
        AesKey key,
        RsaPublicKey publicKey
    )
    {
        return jSRuntime
            .InvokeAsync<byte[]>(
                "CryptoUtils.decryptAesCbcAndVerifyRsa256PssAsync",
                data,
                key,
                publicKey
            )
            .AsTask();
    }

    public Task<AesEncryptedAndRsaSignedData> SignRsa256PssAndEncryptAesCbcAsync(
        byte[] data,
        AesKey key,
        RsaPrivateKey rsaPrivateKey,
        AesIV? iv = null
    )
    {
        return jSRuntime
            .InvokeAsync<AesEncryptedAndRsaSignedData>(
                "CryptoUtils.signRsa256PssAndEncryptAesCbcAsync",
                data,
                key,
                rsaPrivateKey,
                iv
            )
            .AsTask();
    }

    public ValueTask<AesKey> GenerateAesKeyAsync()
    {
        return jSRuntime.InvokeAsync<AesKey>("CryptoUtils.generateAesKey");
    }

    public Task<RsaEncryptedData> EncryptRsaOaepSha256Async(byte[] data, RsaPublicKey publicKey)
    {
        return jSRuntime
            .InvokeAsync<RsaEncryptedData>("CryptoUtils.encryptRsaOaepSha256Async", data, publicKey)
            .AsTask();
    }

    public Task<byte[]> DecryptRsaOaepSha256Async(RsaEncryptedData data, RsaPrivateKey privateKey)
    {
        return jSRuntime
            .InvokeAsync<byte[]>("CryptoUtils.decryptRsaOaepSha256Async", data, privateKey)
            .AsTask();
    }

    public ValueTask<RsaKeyPair> GenerateRsaKeysAsync()
    {
        return jSRuntime.InvokeAsync<RsaKeyPair>("CryptoUtils.generateRsaKeys");
    }

    public Task<byte[]> SignRsaPssSha256Async(byte[] data, RsaPrivateKey privateKey)
    {
        return jSRuntime
            .InvokeAsync<byte[]>("CryptoUtils.signRsaPssSha256Async", data, privateKey)
            .AsTask();
    }

    public Task<bool> VerifyRsaPssSha256Async(byte[] data, byte[] signature, RsaPublicKey publicKey)
    {
        return jSRuntime
            .InvokeAsync<bool>("CryptoUtils.verifyRsaPssSha256Async", data, signature, publicKey)
            .AsTask();
    }
}
