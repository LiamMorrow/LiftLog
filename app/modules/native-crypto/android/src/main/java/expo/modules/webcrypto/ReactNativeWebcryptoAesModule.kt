package expo.modules.webcrypto

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import javax.crypto.Cipher
import javax.crypto.spec.IvParameterSpec
import javax.crypto.spec.SecretKeySpec

class ReactNativeWebcryptoAesModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ReactNativeWebcryptoAes")

    AsyncFunction("encryptCBC") { key: ByteArray, iv: ByteArray, payload: ByteArray ->

      val secretKey = SecretKeySpec(key, "AES")
      val ivSpec = IvParameterSpec(iv)
      val cipher = Cipher.getInstance("AES/CBC/PKCS7Padding")
      cipher.init(Cipher.ENCRYPT_MODE, secretKey, ivSpec)
      cipher.doFinal(payload)
    }

    AsyncFunction("decryptCBC") { key: ByteArray, iv: ByteArray, payload: ByteArray ->
      val secretKey = SecretKeySpec(key, "AES")
      val ivSpec = IvParameterSpec(iv)
      val cipher = Cipher.getInstance("AES/CBC/PKCS7Padding")
      cipher.init(Cipher.DECRYPT_MODE, secretKey, ivSpec)
      cipher.doFinal(payload)
    }

  }
}
