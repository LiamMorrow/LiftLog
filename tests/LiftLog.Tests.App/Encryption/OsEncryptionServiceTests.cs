using System.Security.Cryptography;
using System.Text;
using LiftLog.Lib.Services;

namespace LiftLog.Tests.Encryption;

public class OsEncryptionServiceTests
{
    [Detest]
    public static void Spec() =>
        Describe("OsEncryptionService")
            .As(() =>
            {
                OsEncryptionService sut = new();

                Describe("GenerateKeyPair")
                    .As(() =>
                    {
                        It("will generate a key")
                            .When(async () =>
                            {
                                var key = await sut.GenerateAesKeyAsync();
                                key.Should().NotBeNull();
                            });
                    });

                Describe("Encrypting then Decrypting")
                    .As(() =>
                    {
                        It("Can encrypt and decrypt a payload")
                            .When(async () =>
                            {
                                var key = await sut.GenerateAesKeyAsync();
                                var rsaKeyPair = await sut.GenerateRsaKeysAsync();
                                var data = Encoding.UTF8.GetBytes("Hello, world!");

                                var encryptedData = await sut.SignRsa256PssAndEncryptAesCbcAsync(
                                    data,
                                    key,
                                    rsaKeyPair.PrivateKey
                                );
                                var decryptedData = await sut.DecryptAesCbcAndVerifyRsa256PssAsync(
                                    encryptedData,
                                    key,
                                    rsaKeyPair.PublicKey
                                );

                                decryptedData.Should().BeEquivalentTo(data);
                            });

                        Describe("using a supplied IV")
                            .As(() =>
                            {
                                It("Can encrypt and decrypt a payload")
                                    .When(async () =>
                                    {
                                        // Arrange
                                        var key = await sut.GenerateAesKeyAsync();
                                        var rsaKeyPair = await sut.GenerateRsaKeysAsync();
                                        var data1 = Encoding.UTF8.GetBytes("Hello, world!");
                                        var data2 = Encoding.UTF8.GetBytes("Goodbye, world!");

                                        // Act
                                        var encryptedData1 =
                                            await sut.SignRsa256PssAndEncryptAesCbcAsync(
                                                data1,
                                                key,
                                                rsaKeyPair.PrivateKey
                                            );
                                        var decryptedData1 =
                                            await sut.DecryptAesCbcAndVerifyRsa256PssAsync(
                                                encryptedData1,
                                                key,
                                                rsaKeyPair.PublicKey
                                            );

                                        var encryptedData2 =
                                            await sut.SignRsa256PssAndEncryptAesCbcAsync(
                                                data2,
                                                key,
                                                rsaKeyPair.PrivateKey,
                                                encryptedData1.IV
                                            );
                                        var decryptedData2 =
                                            await sut.DecryptAesCbcAndVerifyRsa256PssAsync(
                                                new AesEncryptedAndRsaSignedData(
                                                    encryptedData2.EncryptedPayload,
                                                    encryptedData1.IV
                                                ),
                                                key,
                                                rsaKeyPair.PublicKey
                                            );

                                        // Assert
                                        Assert.Equal(data1, decryptedData1);
                                        Assert.Equal(data2, decryptedData2);
                                        Assert.Equal(encryptedData1.IV, encryptedData2.IV);
                                    });
                            });

                        Describe("when the payload is tampered with")
                            .As(() =>
                            {
                                It("Throws")
                                    .When(async () =>
                                    {
                                        // Arrange
                                        var key = await sut.GenerateAesKeyAsync();
                                        var rsaKeyPair = await sut.GenerateRsaKeysAsync();
                                        var data = Encoding.UTF8.GetBytes("Hello, world!");

                                        // Act
                                        var encryptedData =
                                            await sut.SignRsa256PssAndEncryptAesCbcAsync(
                                                data,
                                                key,
                                                rsaKeyPair.PrivateKey
                                            );

                                        encryptedData.EncryptedPayload[0] ^= 0xFF;

                                        // Assert
                                        await Assert.ThrowsAsync<SignatureMismatchException>(
                                            async () =>
                                                await sut.DecryptAesCbcAndVerifyRsa256PssAsync(
                                                    encryptedData,
                                                    key,
                                                    rsaKeyPair.PublicKey
                                                )
                                        );
                                    });
                            });
                    });
            });
}
