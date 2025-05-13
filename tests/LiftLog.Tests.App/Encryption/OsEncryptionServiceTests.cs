using System.Security.Cryptography;
using System.Text;
using LiftLog.Lib.Services;

namespace LiftLog.Tests.Encryption;

public class OsEncryptionServiceTests
{
  [Describe("OsEncryptionService")]
  public static void Spec()
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
            File.WriteAllBytes("encrypted.bin", encryptedData.EncryptedPayload);
            File.WriteAllBytes("iv.bin", encryptedData.IV.Value);
            File.WriteAllBytes("key.bin", key.Value);
            File.WriteAllBytes("privateKey.bin", rsaKeyPair.PrivateKey.Pkcs8PrivateKeyBytes);
            File.WriteAllBytes("publicKey.bin", rsaKeyPair.PublicKey.SpkiPublicKeyBytes);
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
                var encryptedData1 = await sut.SignRsa256PssAndEncryptAesCbcAsync(
                  data1,
                  key,
                  rsaKeyPair.PrivateKey
                );
                var decryptedData1 = await sut.DecryptAesCbcAndVerifyRsa256PssAsync(
                  encryptedData1,
                  key,
                  rsaKeyPair.PublicKey
                );

                var encryptedData2 = await sut.SignRsa256PssAndEncryptAesCbcAsync(
                  data2,
                  key,
                  rsaKeyPair.PrivateKey,
                  encryptedData1.IV
                );
                var decryptedData2 = await sut.DecryptAesCbcAndVerifyRsa256PssAsync(
                  new AesEncryptedAndRsaSignedData(
                    encryptedData2.EncryptedPayload,
                    encryptedData1.IV
                  ),
                  key,
                  rsaKeyPair.PublicKey
                );

                // Assert
                data1.Should().Equal(decryptedData1);
                data2.Should().Equal(decryptedData2);
                encryptedData1.IV.Should().BeEquivalentTo(encryptedData2.IV);
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
                var encryptedData = await sut.SignRsa256PssAndEncryptAesCbcAsync(
                  data,
                  key,
                  rsaKeyPair.PrivateKey
                );

                encryptedData.EncryptedPayload[0] ^= 0xFF;

                // Assert
                Assert.ThrowsAsync<SignatureMismatchException>(
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
  }
}
