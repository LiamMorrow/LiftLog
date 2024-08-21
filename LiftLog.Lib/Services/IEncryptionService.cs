namespace LiftLog.Lib.Services;

public interface IEncryptionService
{
    // Also determines the salt length
    public static int RsaHashLength { get; } = 256;

    /// <summary>
    /// Decrypts the data with AES-CBC and verifies the signature with RSA.
    /// CBC does not guarantee integrity, so we need to verify the signature.
    /// The signature will be the last 256 bytes of the decrypted data.
    /// The signature is on the SHA256 hash of the data.
    /// </summary>
    /// <param name="data"></param>
    /// <param name="key"></param>
    /// <param name="publicKey"></param>
    /// <returns></returns>
    Task<byte[]> DecryptAesCbcAndVerifyRsa256PssAsync(
        AesEncryptedAndRsaSignedData data,
        AesKey key,
        RsaPublicKey publicKey
    );

    /// <summary>
    /// Signs the SHA256 hash of the data with RSA then encrypts it (along with then signature) with AES-CBC.
    /// CBC does not guarantee integrity, so we need to supply a signature with the data.
    /// The signature is verified on decryption. Note the signature is also encrypted.
    /// </summary>
    public Task<AesEncryptedAndRsaSignedData> SignRsa256PssAndEncryptAesCbcAsync(
        byte[] data,
        AesKey key,
        RsaPrivateKey rsaPrivateKey,
        AesIV? iv = null
    );

    ValueTask<AesKey> GenerateAesKeyAsync();

    public Task<byte[]> DecryptRsaOaepSha256Async(RsaEncryptedData data, RsaPrivateKey privateKey);

    public Task<RsaEncryptedData> EncryptRsaOaepSha256Async(byte[] data, RsaPublicKey publicKey);

    public ValueTask<RsaKeyPair> GenerateRsaKeysAsync();

    public Task<byte[]> SignRsaPssSha256Async(byte[] data, RsaPrivateKey privateKey);

    public Task<bool> VerifyRsaPssSha256Async(
        byte[] data,
        byte[] signature,
        RsaPublicKey publicKey
    );
}

public record RsaPublicKey(byte[] SpkiPublicKeyBytes);

public record AesKey(byte[] Value);

public record RsaPrivateKey(byte[] Pkcs8PrivateKeyBytes);

public record AesEncryptedAndRsaSignedData(byte[] EncryptedPayload, AesIV IV);

public record RsaEncryptedData(byte[][] DataChunks);

public record RsaKeyPair(RsaPublicKey PublicKey, RsaPrivateKey PrivateKey);

public record AesIV(byte[] Value);
