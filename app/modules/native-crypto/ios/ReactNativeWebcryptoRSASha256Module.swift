import ExpoModulesCore
import Foundation
import Security
import OpenSSL

public class ReactNativeWebcryptoRSASha256Module: Module {

  // Helper function to convert PKCS#1 to PKCS#8 using OpenSSL
  private func convertPKCS1ToPKCS8(_ pkcs1Data: Data) throws -> Data {
    return try pkcs1Data.withUnsafeBytes { pkcs1Bytes in
      guard let pkcs1Ptr = pkcs1Bytes.bindMemory(to: UInt8.self).baseAddress else {
        throw NSError(domain: "ReactNativeWebcryptoRSA", code: -20, userInfo: [NSLocalizedDescriptionKey: "Failed to get PKCS#1 data pointer"])
      }

      // Create BIO from PKCS#1 data
      guard let bio = BIO_new_mem_buf(pkcs1Ptr, Int32(pkcs1Data.count)) else {
        throw NSError(domain: "ReactNativeWebcryptoRSA", code: -21, userInfo: [NSLocalizedDescriptionKey: "Failed to create BIO"])
      }
      defer { BIO_free(bio) }

      // Parse PKCS#1 RSA private key
      guard let rsa = d2i_RSAPrivateKey_bio(bio, nil) else {
        throw NSError(domain: "ReactNativeWebcryptoRSA", code: -22, userInfo: [NSLocalizedDescriptionKey: "Failed to parse PKCS#1 key"])
      }
      defer { RSA_free(rsa) }

      // Create EVP_PKEY from RSA
      guard let evpKey = EVP_PKEY_new() else {
        throw NSError(domain: "ReactNativeWebcryptoRSA", code: -23, userInfo: [NSLocalizedDescriptionKey: "Failed to create EVP_PKEY"])
      }
      defer { EVP_PKEY_free(evpKey) }

      // Set RSA key in EVP_PKEY
      guard EVP_PKEY_set1_RSA(evpKey, rsa) == 1 else {
        throw NSError(domain: "ReactNativeWebcryptoRSA", code: -24, userInfo: [NSLocalizedDescriptionKey: "Failed to set RSA in EVP_PKEY"])
      }

      // Convert to PKCS#8
      guard let pkcs8 = EVP_PKEY2PKCS8(evpKey) else {
        throw NSError(domain: "ReactNativeWebcryptoRSA", code: -25, userInfo: [NSLocalizedDescriptionKey: "Failed to convert to PKCS#8"])
      }
      defer { PKCS8_PRIV_KEY_INFO_free(pkcs8) }

      // Create output BIO for PKCS#8
      guard let outBio = BIO_new(BIO_s_mem()) else {
        throw NSError(domain: "ReactNativeWebcryptoRSA", code: -26, userInfo: [NSLocalizedDescriptionKey: "Failed to create output BIO"])
      }
      defer { BIO_free(outBio) }

      // Write PKCS#8 DER format
      guard i2d_PKCS8_PRIV_KEY_INFO_bio(outBio, pkcs8) == 1 else {
        throw NSError(domain: "ReactNativeWebcryptoRSA", code: -27, userInfo: [NSLocalizedDescriptionKey: "Failed to write PKCS#8"])
      }

      // Get the resulting data
      var dataPtr: UnsafeMutablePointer<CChar>?
      let dataLen = BIO_ctrl_pending(outBio)

      guard dataLen > 0 else {
        throw NSError(domain: "ReactNativeWebcryptoRSA", code: -28, userInfo: [NSLocalizedDescriptionKey: "No data in BIO"])
      }

      let buffer = UnsafeMutablePointer<CChar>.allocate(capacity: Int(dataLen))
      defer { buffer.deallocate() }

      let bytesRead = BIO_read(outBio, buffer, Int32(dataLen))
      guard bytesRead > 0 else {
        throw NSError(domain: "ReactNativeWebcryptoRSA", code: -28, userInfo: [NSLocalizedDescriptionKey: "Failed to read data from BIO"])
      }

      return Data(bytes: buffer, count: Int(bytesRead))
    }
  }

  // Helper function to convert PKCS#1 public key to SPKI using OpenSSL
  private func convertPKCS1PublicToSPKI(_ pkcs1Data: Data) throws -> Data {
    return try pkcs1Data.withUnsafeBytes { pkcs1Bytes in
      guard let pkcs1Ptr = pkcs1Bytes.bindMemory(to: UInt8.self).baseAddress else {
        throw NSError(domain: "ReactNativeWebcryptoRSA", code: -30, userInfo: [NSLocalizedDescriptionKey: "Failed to get PKCS#1 public key data pointer"])
      }

      // Create BIO from PKCS#1 public key data
      guard let bio = BIO_new_mem_buf(pkcs1Ptr, Int32(pkcs1Data.count)) else {
        throw NSError(domain: "ReactNativeWebcryptoRSA", code: -31, userInfo: [NSLocalizedDescriptionKey: "Failed to create BIO for public key"])
      }
      defer { BIO_free(bio) }

      // Parse PKCS#1 RSA public key
      guard let rsa = d2i_RSAPublicKey_bio(bio, nil) else {
        throw NSError(domain: "ReactNativeWebcryptoRSA", code: -32, userInfo: [NSLocalizedDescriptionKey: "Failed to parse PKCS#1 public key"])
      }
      defer { RSA_free(rsa) }

      // Create EVP_PKEY from RSA
      guard let evpKey = EVP_PKEY_new() else {
        throw NSError(domain: "ReactNativeWebcryptoRSA", code: -33, userInfo: [NSLocalizedDescriptionKey: "Failed to create EVP_PKEY for public key"])
      }
      defer { EVP_PKEY_free(evpKey) }

      // Set RSA key in EVP_PKEY
      guard EVP_PKEY_set1_RSA(evpKey, rsa) == 1 else {
        throw NSError(domain: "ReactNativeWebcryptoRSA", code: -34, userInfo: [NSLocalizedDescriptionKey: "Failed to set RSA in EVP_PKEY for public key"])
      }

      // Create output BIO for SPKI
      guard let outBio = BIO_new(BIO_s_mem()) else {
        throw NSError(domain: "ReactNativeWebcryptoRSA", code: -35, userInfo: [NSLocalizedDescriptionKey: "Failed to create output BIO for SPKI"])
      }
      defer { BIO_free(outBio) }

      // Write SPKI DER format (SubjectPublicKeyInfo)
      guard i2d_PUBKEY_bio(outBio, evpKey) == 1 else {
        throw NSError(domain: "ReactNativeWebcryptoRSA", code: -36, userInfo: [NSLocalizedDescriptionKey: "Failed to write SPKI"])
      }

      // Get the resulting data
      let dataLen = BIO_ctrl_pending(outBio)

      guard dataLen > 0 else {
        throw NSError(domain: "ReactNativeWebcryptoRSA", code: -37, userInfo: [NSLocalizedDescriptionKey: "No data in BIO for SPKI"])
      }

      let buffer = UnsafeMutablePointer<CChar>.allocate(capacity: Int(dataLen))
      defer { buffer.deallocate() }

      let bytesRead = BIO_read(outBio, buffer, Int32(dataLen))
      guard bytesRead > 0 else {
        throw NSError(domain: "ReactNativeWebcryptoRSA", code: -38, userInfo: [NSLocalizedDescriptionKey: "Failed to read SPKI data from BIO"])
      }

      return Data(bytes: buffer, count: Int(bytesRead))
    }
  }

  // Helper function to convert SPKI to PKCS#1 public key using OpenSSL
  private func convertSPKIToPKCS1Public(_ spkiData: Data) throws -> Data {
    return try spkiData.withUnsafeBytes { spkiBytes in
      guard let spkiPtr = spkiBytes.bindMemory(to: UInt8.self).baseAddress else {
        throw NSError(domain: "ReactNativeWebcryptoRSA", code: -40, userInfo: [NSLocalizedDescriptionKey: "Failed to get SPKI data pointer"])
      }

      // Create BIO from SPKI data
      guard let bio = BIO_new_mem_buf(spkiPtr, Int32(spkiData.count)) else {
        throw NSError(domain: "ReactNativeWebcryptoRSA", code: -41, userInfo: [NSLocalizedDescriptionKey: "Failed to create BIO for SPKI"])
      }
      defer { BIO_free(bio) }

      // Parse SPKI public key
      guard let evpKey = d2i_PUBKEY_bio(bio, nil) else {
        throw NSError(domain: "ReactNativeWebcryptoRSA", code: -42, userInfo: [NSLocalizedDescriptionKey: "Failed to parse SPKI key"])
      }
      defer { EVP_PKEY_free(evpKey) }

      // Get RSA structure
      guard let rsa = EVP_PKEY_get1_RSA(evpKey) else {
        throw NSError(domain: "ReactNativeWebcryptoRSA", code: -43, userInfo: [NSLocalizedDescriptionKey: "Failed to get RSA from SPKI"])
      }
      defer { RSA_free(rsa) }

      // Create output BIO for PKCS#1
      guard let outBio = BIO_new(BIO_s_mem()) else {
        throw NSError(domain: "ReactNativeWebcryptoRSA", code: -44, userInfo: [NSLocalizedDescriptionKey: "Failed to create output BIO for PKCS#1 public key"])
      }
      defer { BIO_free(outBio) }

      // Convert to PKCS#1 DER format
      guard i2d_RSAPublicKey_bio(outBio, rsa) == 1 else {
        throw NSError(domain: "ReactNativeWebcryptoRSA", code: -45, userInfo: [NSLocalizedDescriptionKey: "Failed to convert to PKCS#1 public key"])
      }

      // Get the resulting data
      let dataLen = BIO_ctrl_pending(outBio)

      guard dataLen > 0 else {
        throw NSError(domain: "ReactNativeWebcryptoRSA", code: -46, userInfo: [NSLocalizedDescriptionKey: "No data in BIO for PKCS#1 public key"])
      }

      let buffer = UnsafeMutablePointer<CChar>.allocate(capacity: Int(dataLen))
      defer { buffer.deallocate() }

      let bytesRead = BIO_read(outBio, buffer, Int32(dataLen))
      guard bytesRead > 0 else {
        throw NSError(domain: "ReactNativeWebcryptoRSA", code: -47, userInfo: [NSLocalizedDescriptionKey: "Failed to read PKCS#1 public key data from BIO"])
      }

      return Data(bytes: buffer, count: Int(bytesRead))
    }
  }

  // Helper function to convert PKCS#8 to PKCS#1 using OpenSSL
  private func convertPKCS8ToPKCS1(_ pkcs8Data: Data) throws -> Data {
    return try pkcs8Data.withUnsafeBytes { pkcs8Bytes in
      guard let pkcs8Ptr = pkcs8Bytes.bindMemory(to: UInt8.self).baseAddress else {
        throw NSError(domain: "ReactNativeWebcryptoRSA", code: -10, userInfo: [NSLocalizedDescriptionKey: "Failed to get PKCS#8 data pointer"])
      }

      // Create BIO from PKCS#8 data
      guard let bio = BIO_new_mem_buf(pkcs8Ptr, Int32(pkcs8Data.count)) else {
        throw NSError(domain: "ReactNativeWebcryptoRSA", code: -11, userInfo: [NSLocalizedDescriptionKey: "Failed to create BIO"])
      }
      defer { BIO_free(bio) }

      // Parse PKCS#8 private key
      guard let pkey = d2i_PKCS8_PRIV_KEY_INFO_bio(bio, nil) else {
        throw NSError(domain: "ReactNativeWebcryptoRSA", code: -12, userInfo: [NSLocalizedDescriptionKey: "Failed to parse PKCS#8 key"])
      }
      defer { PKCS8_PRIV_KEY_INFO_free(pkey) }

      // Extract RSA key from PKCS#8
      guard let evpKey = EVP_PKCS82PKEY(pkey) else {
        throw NSError(domain: "ReactNativeWebcryptoRSA", code: -13, userInfo: [NSLocalizedDescriptionKey: "Failed to extract EVP key"])
      }
      defer { EVP_PKEY_free(evpKey) }

      // Get RSA structure
      guard let rsa = EVP_PKEY_get1_RSA(evpKey) else {
        throw NSError(domain: "ReactNativeWebcryptoRSA", code: -14, userInfo: [NSLocalizedDescriptionKey: "Failed to get RSA key"])
      }
      defer { RSA_free(rsa) }

      // Create output BIO for PKCS#1
      guard let outBio = BIO_new(BIO_s_mem()) else {
        throw NSError(domain: "ReactNativeWebcryptoRSA", code: -15, userInfo: [NSLocalizedDescriptionKey: "Failed to create output BIO"])
      }
      defer { BIO_free(outBio) }

      // Convert to PKCS#1 DER format
      guard i2d_RSAPrivateKey_bio(outBio, rsa) == 1 else {
        throw NSError(domain: "ReactNativeWebcryptoRSA", code: -16, userInfo: [NSLocalizedDescriptionKey: "Failed to convert to PKCS#1"])
      }

      // Get the resulting data
      var dataPtr: UnsafeMutablePointer<CChar>?
      let dataLen = BIO_ctrl_pending(outBio)

      guard dataLen > 0 else {
        throw NSError(domain: "ReactNativeWebcryptoRSA", code: -17, userInfo: [NSLocalizedDescriptionKey: "No data in BIO"])
      }

      let buffer = UnsafeMutablePointer<CChar>.allocate(capacity: Int(dataLen))
      defer { buffer.deallocate() }

      let bytesRead = BIO_read(outBio, buffer, Int32(dataLen))
      guard bytesRead > 0 else {
        throw NSError(domain: "ReactNativeWebcryptoRSA", code: -17, userInfo: [NSLocalizedDescriptionKey: "Failed to read data from BIO"])
      }

      return Data(bytes: buffer, count: Int(bytesRead))
    }
  }

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
      guard let pubDataPKCS1 = SecKeyCopyExternalRepresentation(publicKey, nil) as Data?,
            let privDataPKCS1 = SecKeyCopyExternalRepresentation(privateKey, nil) as Data? else {
        throw NSError(domain: "ReactNativeWebcryptoRSA", code: -1, userInfo: nil)
      }

      // Convert PKCS#1 to PKCS#8 format for private key (cross-platform compatibility)
      let privDataPKCS8 = try self.convertPKCS1ToPKCS8(privDataPKCS1)

      // Convert PKCS#1 to SPKI format for public key (cross-platform compatibility)
      let pubDataSPKI = try self.convertPKCS1PublicToSPKI(pubDataPKCS1)

      return [
        "spkiPublicKeyDer": pubDataSPKI,  // Now actually in SPKI format!
        "pkcs8PrivateKeyDer": privDataPKCS8  // Now actually in PKCS#8 format!
      ]
    }

    AsyncFunction("sign") { (payload: Data, pkcs8PrivateKeyDer: Data) -> Data in
      // Convert PKCS#8 to PKCS#1 format for iOS SecKeyCreateWithData
      let pkcs1Data = try self.convertPKCS8ToPKCS1(pkcs8PrivateKeyDer)

      let attributes: [String: Any] = [
        kSecAttrKeyType as String: kSecAttrKeyTypeRSA,
        kSecAttrKeyClass as String: kSecAttrKeyClassPrivate,
      ]

      guard let privateKey = SecKeyCreateWithData(pkcs1Data as CFData, attributes as CFDictionary, nil) else {
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
      // Convert SPKI to PKCS#1 format for iOS SecKeyCreateWithData
      let pkcs1Data = try self.convertSPKIToPKCS1Public(spkiPublicKeyDer)

      let attributes: [String: Any] = [
        kSecAttrKeyType as String: kSecAttrKeyTypeRSA,
        kSecAttrKeyClass as String: kSecAttrKeyClassPublic,
      ]
      guard let publicKey = SecKeyCreateWithData(pkcs1Data as CFData, attributes as CFDictionary, nil) else {
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
      // Convert SPKI to PKCS#1 format for iOS SecKeyCreateWithData
      let pkcs1Data = try self.convertSPKIToPKCS1Public(spkiPublicKeyDer)

      let attributes: [String: Any] = [
        kSecAttrKeyType as String: kSecAttrKeyTypeRSA,
        kSecAttrKeyClass as String: kSecAttrKeyClassPublic,
      ]
      guard let publicKey = SecKeyCreateWithData(pkcs1Data as CFData, attributes as CFDictionary, nil) else {
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
      // Convert PKCS#8 to PKCS#1 format for iOS SecKeyCreateWithData
      let pkcs1Data = try self.convertPKCS8ToPKCS1(pkcs8PrivateKeyDer)

      let attributes: [String: Any] = [
        kSecAttrKeyType as String: kSecAttrKeyTypeRSA,
        kSecAttrKeyClass as String: kSecAttrKeyClassPrivate,
      ]

      guard let privateKey = SecKeyCreateWithData(pkcs1Data as CFData, attributes as CFDictionary, nil) else {
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
