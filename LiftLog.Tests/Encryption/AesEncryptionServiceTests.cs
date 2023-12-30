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

    [Fact]
    public async Task EncryptAndDecrypt_EncryptsAndDecryptsDataGivenSameIV()
    {
        // Arrange
        var key = await _encryptionService.GenerateKeyAsync();
        var data1 = Encoding.UTF8.GetBytes("Hello, world!");
        var data2 = Encoding.UTF8.GetBytes("Goodbye, world!");

        // Act
        var (encryptedData1, iv) = await _encryptionService.EncryptAsync(data1, key);
        var decryptedData1 = await _encryptionService.DecryptAsync(encryptedData1, iv, key);

        var (encryptedData2, _) = await _encryptionService.EncryptAsync(data2, key, iv);
        var decryptedData2 = await _encryptionService.DecryptAsync(encryptedData2, iv, key);

        // Assert
        Assert.Equal(data1, decryptedData1);
        Assert.Equal(data2, decryptedData2);
    }
}
