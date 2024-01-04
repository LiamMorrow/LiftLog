namespace LiftLog.Lib.Services;

public interface IEncryptionService
{
    ValueTask<byte[]> DecryptAsync(byte[] data, byte[] key, byte[] IV);

    public ValueTask<(byte[] EncryptedPayload, byte[] IV)> EncryptAsync(
        byte[] data,
        byte[] key,
        byte[]? iv = null
    );
    ValueTask<byte[]> GenerateKeyAsync();
}
