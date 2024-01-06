namespace LiftLog.Lib.Services;

public interface IEncryptionService
{
    ValueTask<byte[]> DecryptAesAsync(byte[] data, byte[] key, byte[] IV);

    public ValueTask<(byte[] EncryptedPayload, byte[] IV)> EncryptAesAsync(
        byte[] data,
        byte[] key,
        byte[]? iv = null
    );

    ValueTask<byte[]> GenerateAesKeyAsync();

    public ValueTask<byte[]> DecryptRsaAsync(byte[] data, byte[] privateKey);

    public ValueTask<byte[]> EncryptRsaAsync(byte[] data, byte[] publicKey);

    public ValueTask<(byte[] PublicKey, byte[] PrivateKey)> GenerateRsaKeysAsync();
}
