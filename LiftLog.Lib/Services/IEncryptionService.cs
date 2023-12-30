namespace LiftLog.Lib.Services;

public interface IEncryptionService
{
    ValueTask<byte[]> DecryptAsync(byte[] data, byte[] IV, byte[] key);

    public ValueTask<(byte[] EncryptedPayload, byte[] IV)> EncryptAsync(byte[] data, byte[] key);
    ValueTask<byte[]> GenerateKeyAsync();
}
