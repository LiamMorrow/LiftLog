using System.Security.Cryptography;

namespace LiftLog.Lib.Services;

[System.Runtime.Versioning.UnsupportedOSPlatform("browser")]
public class OsEncryptionService : IEncryptionService
{
    public ValueTask<byte[]> DecryptAesAsync(byte[] data, byte[] key, byte[] IV)
    {
        var aes = Aes.Create();

        aes.IV = IV;
        aes.Key = key;

        using var decryptor = aes.CreateDecryptor();

        return ValueTask.FromResult(decryptor.TransformFinalBlock(data, 0, data.Length));
    }

    public ValueTask<(byte[] EncryptedPayload, byte[] IV)> EncryptAesAsync(
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

    public ValueTask<byte[]> GenerateAesKeyAsync()
    {
        //Generate a public/private key pair.
        var aes = Aes.Create();
        aes.GenerateKey();

        return ValueTask.FromResult(aes.Key);
    }

    public ValueTask<byte[]> EncryptRsaAsync(byte[] data, byte[] publicKey)
    {
        var rsa = RSA.Create();

        rsa.ImportRSAPublicKey(publicKey, out _);

        return ValueTask.FromResult(rsa.Encrypt(data, RSAEncryptionPadding.Pkcs1));
    }

    public ValueTask<byte[]> DecryptRsaAsync(byte[] data, byte[] privateKey)
    {
        var rsa = RSA.Create();

        rsa.ImportRSAPrivateKey(privateKey, out _);

        return ValueTask.FromResult(rsa.Decrypt(data, RSAEncryptionPadding.Pkcs1));
    }

    public ValueTask<(byte[] PublicKey, byte[] PrivateKey)> GenerateRsaKeysAsync()
    {
        var rsa = RSA.Create();

        return ValueTask.FromResult((rsa.ExportRSAPublicKey(), rsa.ExportRSAPrivateKey()));
    }
}
