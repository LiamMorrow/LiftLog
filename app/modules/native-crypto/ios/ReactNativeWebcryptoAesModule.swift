import ExpoModulesCore
import Foundation
import CommonCrypto

public class ReactNativeWebcryptoAesModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ReactNativeWebcryptoAes")

    AsyncFunction("encryptCBC") { (key: Data, iv: Data, payload: Data) -> Data in
      let cryptLength = size_t(payload.count + kCCBlockSizeAES128)
      var cryptData = Data(count: cryptLength)
      var numBytesEncrypted: size_t = 0

      let status = cryptData.withUnsafeMutableBytes { cryptBytes in
        payload.withUnsafeBytes { dataBytes in
          iv.withUnsafeBytes { ivBytes in
            key.withUnsafeBytes { keyBytes in
              CCCrypt(
                CCOperation(kCCEncrypt),
                CCAlgorithm(kCCAlgorithmAES),
                CCOptions(kCCOptionPKCS7Padding),
                keyBytes.baseAddress, key.count,
                ivBytes.baseAddress,
                dataBytes.baseAddress, payload.count,
                cryptBytes.baseAddress, cryptLength,
                &numBytesEncrypted
              )
            }
          }
        }
      }

      guard status == kCCSuccess else {
        throw NSError(domain: "ReactNativeWebcryptoAes", code: Int(status), userInfo: nil)
      }
      return cryptData.prefix(numBytesEncrypted)
    }

    AsyncFunction("decryptCBC") { (key: Data, iv: Data, payload: Data) -> Data in
      let cryptLength = size_t(payload.count)
      var cryptData = Data(count: cryptLength)
      var numBytesDecrypted: size_t = 0

      let status = cryptData.withUnsafeMutableBytes { cryptBytes in
        payload.withUnsafeBytes { dataBytes in
          iv.withUnsafeBytes { ivBytes in
            key.withUnsafeBytes { keyBytes in
              CCCrypt(
                CCOperation(kCCDecrypt),
                CCAlgorithm(kCCAlgorithmAES),
                CCOptions(kCCOptionPKCS7Padding),
                keyBytes.baseAddress, key.count,
                ivBytes.baseAddress,
                dataBytes.baseAddress, payload.count,
                cryptBytes.baseAddress, cryptLength,
                &numBytesDecrypted
              )
            }
          }
        }
      }

      guard status == kCCSuccess else {
        throw NSError(domain: "ReactNativeWebcryptoAes", code: Int(status), userInfo: nil)
      }
      return cryptData.prefix(numBytesDecrypted)
    }
  }
}
