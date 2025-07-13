package expo.modules.webcrypto

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.security.*
import java.security.spec.*
import javax.crypto.Cipher

class ReactNativeWebcryptoRSASha256Module : Module() {
  override fun definition() = ModuleDefinition {
    Name("ReactNativeWebcryptoRSASha256")

    // Generates a RSA KeyPair. The returned value is the RSA-PSS keyPair
    AsyncFunction("generateKeyPair") { length: Int ->
      val keyPairGenerator = KeyPairGenerator.getInstance("RSA")
      keyPairGenerator.initialize(length)
      val keyPair = keyPairGenerator.generateKeyPair()
      val publicKey = keyPair.public
      val privateKey = keyPair.private

      val spkiPublicKeyDer = publicKey.encoded // X.509/SPKI
      val pkcs8PrivateKeyDer = privateKey.encoded // PKCS8

      mapOf(
        "spkiPublicKeyDer" to spkiPublicKeyDer,
        "pkcs8PrivateKeyDer" to pkcs8PrivateKeyDer
      )
    }

    // Signs a payload using RSA-PSS and SHA256
    // Returns the signature as a ByteArray
    AsyncFunction("sign") { payload: ByteArray, pkcs8PrivateKeyDer: ByteArray ->
      val keyFactory = KeyFactory.getInstance("RSA")
      val privateKeySpec = PKCS8EncodedKeySpec(pkcs8PrivateKeyDer)
      val privateKey = keyFactory.generatePrivate(privateKeySpec)

      val signature = Signature.getInstance("SHA256withRSA/PSS")
      val pssParamSpec = PSSParameterSpec(
        "SHA-256",
        "MGF1",
        MGF1ParameterSpec.SHA256,
        32,
        1
      )
      signature.setParameter(pssParamSpec)
      signature.initSign(privateKey)
      signature.update(payload)
      signature.sign()
    }

    // Returns a boolean indicating if the payload can be verified by the signature and public key using RSA-PSS and SHA256
    AsyncFunction("verify") { payload: ByteArray, signatureBytes: ByteArray, spkiPublicKeyDer: ByteArray ->
      val keyFactory = KeyFactory.getInstance("RSA")
      val publicKeySpec = X509EncodedKeySpec(spkiPublicKeyDer)
      val publicKey = keyFactory.generatePublic(publicKeySpec)

      val signature = Signature.getInstance("SHA256withRSA/PSS")
      val pssParamSpec = PSSParameterSpec(
        "SHA-256",
        "MGF1",
        MGF1ParameterSpec.SHA256,
        32,
        1
      )
      signature.setParameter(pssParamSpec)
      signature.initVerify(publicKey)
      signature.update(payload)
      signature.verify(signatureBytes)
    }

    // Encrypts using RSA-OAEP and SHA256
    // Returns the encrypted value as a ByteArray
    AsyncFunction("encrypt") { payload: ByteArray, spkiPublicKeyDer: ByteArray ->
      val keyFactory = KeyFactory.getInstance("RSA")
      val publicKeySpec = X509EncodedKeySpec(spkiPublicKeyDer)
      val publicKey = keyFactory.generatePublic(publicKeySpec)

      val cipher = Cipher.getInstance("RSA/ECB/OAEPWithSHA-256AndMGF1Padding")
      cipher.init(Cipher.ENCRYPT_MODE, publicKey)
      cipher.doFinal(payload)
    }

    // Decrypts using RSA-OAEP and SHA256
    // Returns the decrypted value as a ByteArray
    AsyncFunction("decrypt") { payload: ByteArray, pkcs8PrivateKeyDer: ByteArray ->
      val keyFactory = KeyFactory.getInstance("RSA")
      val privateKeySpec = PKCS8EncodedKeySpec(pkcs8PrivateKeyDer)
      val privateKey = keyFactory.generatePrivate(privateKeySpec)

      val cipher = Cipher.getInstance("RSA/ECB/OAEPWithSHA-256AndMGF1Padding")
      cipher.init(Cipher.DECRYPT_MODE, privateKey)
      cipher.doFinal(payload)
    }
  }
}
