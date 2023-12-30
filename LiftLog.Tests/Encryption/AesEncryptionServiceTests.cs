using System.Text;
using LiftLog.Lib.Services;

namespace LiftLog.Tests.Encryption;

public class AesEncryptionServiceTests
{
    private readonly AesEncryptionService _encryptionService;

    public AesEncryptionServiceTests()
    {
        _encryptionService = new AesEncryptionService();
    }

    [Fact]
    public void GenerateKeyPair_GeneratesKey()
    {
        // Arrange
        // Act
        var (iv, key) = _encryptionService.GenerateKey();

        // Assert
        Assert.NotNull(iv);
        Assert.NotNull(key);
    }

    [Fact]
    public void EncryptAndDecrypt_EncryptsAndDecryptsData()
    {
        // Arrange
        var (iv, key) = _encryptionService.GenerateKey();
        var data = Encoding.UTF8.GetBytes("Hello, world!");

        // Act
        var encryptedData = _encryptionService.Encrypt(data, iv, key);
        var decryptedData = _encryptionService.Decrypt(encryptedData, iv, key);

        // Assert
        Assert.Equal(data, decryptedData);
    }
}
