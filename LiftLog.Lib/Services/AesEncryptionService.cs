using System.Security.Cryptography;

namespace LiftLog.Lib.Services;

[System.Runtime.Versioning.UnsupportedOSPlatform("browser")]
public class AesEncryptionService : IEncryptionService
{
    public byte[] Decrypt(byte[] data, byte[] IV, byte[] key)
    {
        var aes = Aes.Create();

        aes.IV = IV;
        aes.Key = key;

        using var decryptor = aes.CreateDecryptor();

        return decryptor.TransformFinalBlock(data, 0, data.Length);
    }

    public byte[] Encrypt(byte[] data, byte[] IV, byte[] key)
    {
        var aes = Aes.Create();

        aes.IV = IV;
        aes.Key = key;

        using var encryptor = aes.CreateEncryptor();

        return encryptor.TransformFinalBlock(data, 0, data.Length);
    }

    public (byte[] IV, byte[] Key) GenerateKey()
    {
        //Generate a public/private key pair.
        var aes = Aes.Create();
        aes.GenerateIV();
        aes.GenerateKey();

        return (aes.IV, aes.Key);
    }
}
