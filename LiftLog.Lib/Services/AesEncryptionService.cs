using System.Security.Cryptography;

namespace LiftLog.Lib.Services;

[System.Runtime.Versioning.UnsupportedOSPlatform("browser")]
public class AesEncryptionService : IEncryptionService
{
    public ValueTask<byte[]> DecryptAsync(byte[] data, byte[] key, byte[] IV)
    {
        var aes = Aes.Create();

        aes.IV = IV;
        aes.Key = key;

        using var decryptor = aes.CreateDecryptor();

        return ValueTask.FromResult(decryptor.TransformFinalBlock(data, 0, data.Length));
    }

    public ValueTask<(byte[] EncryptedPayload, byte[] IV)> EncryptAsync(
        byte[] data,
        byte[] key,
        byte[]? iv = null
    )
    {
        var aes = Aes.Create();

        if (iv is not null)
        {
            aes.IV = iv;
        }
        else
        {
            aes.GenerateIV();
        }
        aes.Key = key;

        using var encryptor = aes.CreateEncryptor();

        return ValueTask.FromResult((encryptor.TransformFinalBlock(data, 0, data.Length), aes.IV));
    }

    public ValueTask<byte[]> GenerateKeyAsync()
    {
        //Generate a public/private key pair.
        var aes = Aes.Create();
        aes.GenerateKey();

        return ValueTask.FromResult(aes.Key);
    }
}
