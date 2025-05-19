import ExpoModulesCore
import Foundation
import Security

public class ReactNativeWebcryptoRSASha256Module: Module {
  public func definition() -> ModuleDefinition {
    Name("ReactNativeWebcryptoRSASha256")

    AsyncFunction("generateKeyPair") { (length: Int) -> [String: Data] in
      let tag = "com.example.keys.mykey".data(using: .utf8)!
      let privateKeyParams: [String: Any] = [
        kSecAttrIsPermanent as String: false,
        kSecAttrApplicationTag as String: tag
      ]
      let publicKeyParams: [String: Any] = [
        kSecAttrIsPermanent as String: false,
        kSecAttrApplicationTag as String: tag
      ]
      let parameters: [String: Any] = [
        kSecAttrKeyType as String: kSecAttrKeyTypeRSA,
        kSecAttrKeySizeInBits as String: length,
        kSecPrivateKeyAttrs as String: privateKeyParams,
        kSecPublicKeyAttrs as String: publicKeyParams
      ]
      var pubKey, privKey: SecKey?
      let status = SecKeyGeneratePair(parameters as CFDictionary, &pubKey, &privKey)
      guard status == errSecSuccess, let publicKey = pubKey, let privateKey = privKey else {
        throw NSError(domain: "ReactNativeWebcryptoRSA", code: Int(status), userInfo: nil)
      }
      guard let pubData = SecKeyCopyExternalRepresentation(publicKey, nil) as Data?,
            let privData = SecKeyCopyExternalRepresentation(privateKey, nil) as Data? else {
        throw NSError(domain: "ReactNativeWebcryptoRSA", code: -1, userInfo: nil)
      }
      return [
        "spkiPublicKeyDer": pubData,
        "pkcs8PrivateKeyDer": privData
      ]
    }

    AsyncFunction("sign") { (payload: Data, pkcs8PrivateKeyDer: Data) -> Data in
      let attributes: [String: Any] = [
        kSecAttrKeyType as String: kSecAttrKeyTypeRSA,
        kSecAttrKeyClass as String: kSecAttrKeyClassPrivate,
      ]
      guard let privateKey = SecKeyCreateWithData(pkcs8PrivateKeyDer as CFData, attributes as CFDictionary, nil) else {
        throw NSError(domain: "ReactNativeWebcryptoRSA", code: -2, userInfo: nil)
      }
      var error: Unmanaged<CFError>?
      guard let signature = SecKeyCreateSignature(
        privateKey,
        .rsaSignatureMessagePSSSHA256,
        payload as CFData,
        &error
      ) as Data? else {
        throw error!.takeRetainedValue() as Error
      }
      return signature
    }

    AsyncFunction("verify") { (payload: Data, signatureBytes: Data, spkiPublicKeyDer: Data) -> Bool in
      let attributes: [String: Any] = [
        kSecAttrKeyType as String: kSecAttrKeyTypeRSA,
        kSecAttrKeyClass as String: kSecAttrKeyClassPublic,
      ]
      guard let publicKey = SecKeyCreateWithData(spkiPublicKeyDer as CFData, attributes as CFDictionary, nil) else {
        throw NSError(domain: "ReactNativeWebcryptoRSA", code: -3, userInfo: nil)
      }
      var error: Unmanaged<CFError>?
      let result = SecKeyVerifySignature(
        publicKey,
        .rsaSignatureMessagePSSSHA256,
        payload as CFData,
        signatureBytes as CFData,
        &error
      )
      if let error = error {
        throw error.takeRetainedValue() as Error
      }
      return result
    }

    AsyncFunction("encrypt") { (payload: Data, spkiPublicKeyDer: Data) -> Data in
      let attributes: [String: Any] = [
        kSecAttrKeyType as String: kSecAttrKeyTypeRSA,
        kSecAttrKeyClass as String: kSecAttrKeyClassPublic,
      ]
      guard let publicKey = SecKeyCreateWithData(spkiPublicKeyDer as CFData, attributes as CFDictionary, nil) else {
        throw NSError(domain: "ReactNativeWebcryptoRSA", code: -4, userInfo: nil)
      }
      var error: Unmanaged<CFError>?
      guard let encrypted = SecKeyCreateEncryptedData(
        publicKey,
        .rsaEncryptionOAEPSHA256,
        payload as CFData,
        &error
      ) as Data? else {
        throw error!.takeRetainedValue() as Error
      }
      return encrypted
    }

    AsyncFunction("decrypt") { (payload: Data, pkcs8PrivateKeyDer: Data) -> Data in
      let attributes: [String: Any] = [
        kSecAttrKeyType as String: kSecAttrKeyTypeRSA,
        kSecAttrKeyClass as String: kSecAttrKeyClassPrivate,
      ]
      guard let privateKey = SecKeyCreateWithData(pkcs8PrivateKeyDer as CFData, attributes as CFDictionary, nil) else {
        throw NSError(domain: "ReactNativeWebcryptoRSA", code: -5, userInfo: nil)
      }
      var error: Unmanaged<CFError>?
      guard let decrypted = SecKeyCreateDecryptedData(
        privateKey,
        .rsaEncryptionOAEPSHA256,
        payload as CFData,
        &error
      ) as Data? else {
        throw error!.takeRetainedValue() as Error
      }
      return decrypted
    }
  }
}
