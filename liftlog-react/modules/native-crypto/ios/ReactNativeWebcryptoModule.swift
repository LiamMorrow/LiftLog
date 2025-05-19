import ExpoModulesCore
import Foundation
import CommonCrypto

public class ReactNativeWebcryptoModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ReactNativeWebcrypto")

    Function("randomUuid") {
      UUID().uuidString
    }

    Function("getRandomValues") { (length: Int) -> Data in
      var bytes = [UInt8](repeating: 0, count: length)
      let result = SecRandomCopyBytes(kSecRandomDefault, length, &bytes)
      if result == errSecSuccess {
        return Data(bytes)
      } else {
        throw NSError(domain: "ReactNativeWebcrypto", code: Int(result), userInfo: nil)
      }
    }


    AsyncFunction("sha256") { (payload: Data) async throws -> Data in
      var hash = [UInt8](repeating: 0, count: Int(CC_SHA256_DIGEST_LENGTH))
      payload.withUnsafeBytes {
      _ = CC_SHA256($0.baseAddress, CC_LONG(payload.count), &hash)
      }
      return Data(hash)
    }
  }
}
