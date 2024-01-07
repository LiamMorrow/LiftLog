using System.Security.Cryptography;

namespace LiftLog.Lib.Services;

[System.Runtime.Versioning.UnsupportedOSPlatform("browser")]
public class OsEncryptionService : IEncryptionService
{
    public ValueTask<byte[]> DecryptAesCbcAndVerifyRsa256PssAsync(
        AesEncryptedAndRsaSignedData encryptedPayload,
        AesKey key,
        RsaPublicKey publicKey
    )
    {
        var aes = Aes.Create();

        aes.IV = encryptedPayload.IV.Value;
        aes.Key = key.Value;

        using var decryptor = aes.CreateDecryptor();

        var decrypted = decryptor.TransformFinalBlock(
            encryptedPayload.EncryptedPayload,
            0,
            encryptedPayload.EncryptedPayload.Length
        );

        var data = decrypted[..^IEncryptionService.RsaHashLength];
        var signature = decrypted[^IEncryptionService.RsaHashLength..];

        var rsa = RSA.Create();
        rsa.ImportSubjectPublicKeyInfo(publicKey.SpkiPublicKeyBytes, out _);
        var dataHash = SHA256.HashData(data);

        if (!rsa.VerifyData(dataHash, signature, HashAlgorithmName.SHA256, RSASignaturePadding.Pss))
        {
            throw new SignatureMismatchException("Signature verification failed");
        }

        return ValueTask.FromResult(data);
    }

    public ValueTask<AesEncryptedAndRsaSignedData> SignRsa256PssAndEncryptAesCbcAsync(
        byte[] data,
        AesKey key,
        RsaPrivateKey rsaPrivateKey,
        AesIV? iv = null
    )
    {
        var rsa = RSA.Create(2048);

        rsa.ImportPkcs8PrivateKey(rsaPrivateKey.Pkcs8PrivateKeyBytes, out _);

        var dataHash = SHA256.HashData(data);
        var signature = rsa.SignData(dataHash, HashAlgorithmName.SHA256, RSASignaturePadding.Pss);

        var dataAndSignature = new byte[data.Length + signature.Length];
        data.CopyTo(dataAndSignature, 0);
        signature.CopyTo(dataAndSignature, data.Length);

        var aes = Aes.Create();

        if (iv is not null)
        {
            aes.IV = iv.Value;
        }
        else
        {
            aes.GenerateIV();
        }
        aes.Key = key.Value;

        using var encryptor = aes.CreateEncryptor();

        return ValueTask.FromResult(
            new AesEncryptedAndRsaSignedData(
                encryptor.TransformFinalBlock(dataAndSignature, 0, dataAndSignature.Length),
                new AesIV(iv?.Value ?? aes.IV)
            )
        );
    }

    public ValueTask<AesKey> GenerateAesKeyAsync()
    {
        //Generate a public/private key pair.
        var aes = Aes.Create();
        aes.GenerateKey();

        return ValueTask.FromResult(new AesKey(aes.Key));
    }

    public ValueTask<RsaEncryptedData> EncryptRsaOaepSha256Async(
        byte[] data,
        RsaPublicKey publicKey
    )
    {
        var rsa = RSA.Create(2048);

        rsa.ImportSubjectPublicKeyInfo(publicKey.SpkiPublicKeyBytes, out _);

        // encrypt one chunk at a time, as RSA has a size limit of 122ish bytes
        var encryptedChunks = new byte[(data.Length / 122) + 1][];
        for (var i = 0; i < encryptedChunks.Length; i++)
        {
            encryptedChunks[i] = rsa.Encrypt(
                data[(i * 122)..Math.Min((i + 1) * 122, data.Length)],
                RSAEncryptionPadding.OaepSHA256
            );
        }

        return ValueTask.FromResult(new RsaEncryptedData(encryptedChunks));
    }

    public ValueTask<byte[]> DecryptRsaOaepSha256Async(
        RsaEncryptedData data,
        RsaPrivateKey privateKey
    )
    {
        var rsa = RSA.Create();

        rsa.ImportPkcs8PrivateKey(privateKey.Pkcs8PrivateKeyBytes, out _);

        // decrypt one chunk at a time

        var decrypted = new byte[data.DataChunks.Length][];
        for (var i = 0; i < data.DataChunks.Length; i++)
        {
            decrypted[i] = rsa.Decrypt(data.DataChunks[i], RSAEncryptionPadding.OaepSHA256);
        }

        return ValueTask.FromResult(decrypted.SelectMany(x => x).ToArray());
    }

    public ValueTask<RsaKeyPair> GenerateRsaKeysAsync()
    {
        var rsa = RSA.Create(2048);

        return ValueTask.FromResult(
            new RsaKeyPair(
                new RsaPublicKey(rsa.ExportSubjectPublicKeyInfo()),
                new RsaPrivateKey(rsa.ExportPkcs8PrivateKey())
            )
        );
    }
}
