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
    public async Task GenerateKeyPair_GeneratesKey()
    {
        // Arrange
        // Act
        var key = await _encryptionService.GenerateKeyAsync();

        // Assert
        Assert.NotNull(key);
    }

    [Fact]
    public async Task EncryptAndDecrypt_EncryptsAndDecryptsData()
    {
        // Arrange
        var key = await _encryptionService.GenerateKeyAsync();
        var data = Encoding.UTF8.GetBytes("Hello, world!");

        // Act
        var (encryptedData, iv) = await _encryptionService.EncryptAsync(data, key);
        var decryptedData = await _encryptionService.DecryptAsync(encryptedData, iv, key);

        // Assert
        Assert.Equal(data, decryptedData);
    }
}
