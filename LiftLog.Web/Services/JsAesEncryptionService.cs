using LiftLog.Lib.Services;

namespace LiftLog.Web.Services;

// Dotnet AES-GCM implementation is not compatible with the JS implementation
public class JsAesEncryptionService : IEncryptionService
{
    public ValueTask<byte[]> DecryptAsync(byte[] data, byte[] IV, byte[] key)
    {
        throw new NotImplementedException();
    }

    public ValueTask<(byte[] EncryptedPayload, byte[] IV)> EncryptAsync(
        byte[] data,
        byte[] key,
        byte[]? iv = null
    )
    {
        throw new NotImplementedException();
    }

    public ValueTask<byte[]> GenerateKeyAsync()
    {
        throw new NotImplementedException();
    }
}
