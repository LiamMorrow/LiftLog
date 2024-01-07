using System.Security.Cryptography;
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
    public async Task EncryptAndDecrypt_EncryptsAndDecryptsAesData()
    {
        // Arrange
        var key = await _encryptionService.GenerateAesKeyAsync();
        var rsaKeyPair = await _encryptionService.GenerateRsaKeysAsync();
        var data = Encoding.UTF8.GetBytes("Hello, world!");

        // Act
        var encryptedData = await _encryptionService.SignRsa256PssAndEncryptAesCbcAsync(
            data,
            key,
            rsaKeyPair.PrivateKey
        );
        var decryptedData = await _encryptionService.DecryptAesCbcAndVerifyRsa256PssAsync(
            encryptedData,
            key,
            rsaKeyPair.PublicKey
        );

        // Assert
        Assert.Equal(data, decryptedData);
    }

    [Fact]
    public async Task EncryptAndDecrypt_EncryptsAndDecryptsDataGivenSameIV()
    {
        // Arrange
        var key = await _encryptionService.GenerateAesKeyAsync();
        var rsaKeyPair = await _encryptionService.GenerateRsaKeysAsync();
        var data1 = Encoding.UTF8.GetBytes("Hello, world!");
        var data2 = Encoding.UTF8.GetBytes("Goodbye, world!");

        // Act
        var encryptedData1 = await _encryptionService.SignRsa256PssAndEncryptAesCbcAsync(
            data1,
            key,
            rsaKeyPair.PrivateKey
        );
        var decryptedData1 = await _encryptionService.DecryptAesCbcAndVerifyRsa256PssAsync(
            encryptedData1,
            key,
            rsaKeyPair.PublicKey
        );

        var encryptedData2 = await _encryptionService.SignRsa256PssAndEncryptAesCbcAsync(
            data2,
            key,
            rsaKeyPair.PrivateKey,
            encryptedData1.IV
        );
        var decryptedData2 = await _encryptionService.DecryptAesCbcAndVerifyRsa256PssAsync(
            new AesEncryptedAndRsaSignedData(encryptedData2.EncryptedPayload, encryptedData1.IV),
            key,
            rsaKeyPair.PublicKey
        );

        // Assert
        Assert.Equal(data1, decryptedData1);
        Assert.Equal(data2, decryptedData2);
        Assert.Equal(encryptedData1.IV, encryptedData2.IV);
    }

    [Fact]
    public async Task EncryptAndDecrypt_DecryptionThrowsIfPayloadTamperedWith()
    {
        // Arrange
        var key = await _encryptionService.GenerateAesKeyAsync();
        var rsaKeyPair = await _encryptionService.GenerateRsaKeysAsync();
        var data = Encoding.UTF8.GetBytes("Hello, world!");

        // Act
        var encryptedData = await _encryptionService.SignRsa256PssAndEncryptAesCbcAsync(
            data,
            key,
            rsaKeyPair.PrivateKey
        );

        encryptedData.EncryptedPayload[0] ^= 0xFF;

        // Assert
        await Assert.ThrowsAsync<SignatureMismatchException>(
            async () =>
                await _encryptionService.DecryptAesCbcAndVerifyRsa256PssAsync(
                    encryptedData,
                    key,
                    rsaKeyPair.PublicKey
                )
        );
    }
}
