using System.Text;
using LiftLog.Lib.Services;

namespace LiftLog.Tests.Encryption;

public class OsEncryptionServiceTests
{
    private readonly OsEncryptionService _encryptionService;

    public OsEncryptionServiceTests()
    {
        _encryptionService = new OsEncryptionService();
    }

    [Fact]
    public async Task GenerateKeyPair_GeneratesKey()
    {
        // Arrange
        // Act
        var key = await _encryptionService.GenerateAesKeyAsync();

        // Assert
        Assert.NotNull(key);
    }

    [Fact]
    public async Task EncryptAndDecrypt_EncryptsAndDecryptsData()
    {
        // Arrange
        var key = await _encryptionService.GenerateAesKeyAsync();
        var data = Encoding.UTF8.GetBytes("Hello, world!");

        // Act
        var (encryptedData, iv) = await _encryptionService.EncryptAesAsync(data, key);
        var decryptedData = await _encryptionService.DecryptAesAsync(encryptedData, key, iv);

        // Assert
        Assert.Equal(data, decryptedData);
    }

    [Fact]
    public async Task EncryptAndDecrypt_EncryptsAndDecryptsDataGivenSameIV()
    {
        // Arrange
        var key = await _encryptionService.GenerateAesKeyAsync();
        var data1 = Encoding.UTF8.GetBytes("Hello, world!");
        var data2 = Encoding.UTF8.GetBytes("Goodbye, world!");

        // Act
        var (encryptedData1, iv) = await _encryptionService.EncryptAesAsync(data1, key);
        var decryptedData1 = await _encryptionService.DecryptAesAsync(encryptedData1, key, iv);

        var (encryptedData2, _) = await _encryptionService.EncryptAesAsync(data2, key, iv);
        var decryptedData2 = await _encryptionService.DecryptAesAsync(encryptedData2, key, iv);

        // Assert
        Assert.Equal(data1, decryptedData1);
        Assert.Equal(data2, decryptedData2);
    }
}
