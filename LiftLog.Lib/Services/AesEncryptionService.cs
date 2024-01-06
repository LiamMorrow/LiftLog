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

    public ValueTask<byte[][]> EncryptRsaAsync(byte[] data, byte[] publicKey)
    {
        var rsa = RSA.Create(4096);

        rsa.ImportSubjectPublicKeyInfo(publicKey, out _);
        // encrypt one chunk at a time, as RSA has a size limit of 245 bytes

        var encrypted = new byte[(data.Length / 245) + 1][];
        for (var i = 0; i < encrypted.Length; i++)
        {
            encrypted[i] = rsa.Encrypt(
                data[(i * 245)..Math.Min((i + 1) * 245, data.Length)],
                RSAEncryptionPadding.OaepSHA256
            );
        }

        return ValueTask.FromResult(encrypted);
    }

    public ValueTask<byte[]> DecryptRsaAsync(byte[][] data, byte[] privateKey)
    {
        var rsa = RSA.Create();

        rsa.ImportPkcs8PrivateKey(privateKey, out _);

        // decrypt one chunk at a time

        var decrypted = new byte[data.Length][];
        for (var i = 0; i < data.Length; i++)
        {
            decrypted[i] = rsa.Decrypt(data[i], RSAEncryptionPadding.OaepSHA256);
        }

        return ValueTask.FromResult(decrypted.SelectMany(x => x).ToArray());
    }

    public ValueTask<(byte[] PublicKey, byte[] PrivateKey)> GenerateRsaKeysAsync()
    {
        var rsa = RSA.Create(4096);

        return ValueTask.FromResult(
            (rsa.ExportSubjectPublicKeyInfo(), rsa.ExportPkcs8PrivateKey())
        );
    }
}
