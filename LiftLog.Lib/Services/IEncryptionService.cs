namespace LiftLog.Lib.Services;

public interface IEncryptionService
{
    byte[] Decrypt(byte[] data, byte[] IV, byte[] key);
    byte[] Encrypt(byte[] data, byte[] IV, byte[] key);
    (byte[] IV, byte[] Key) GenerateKey();
}
