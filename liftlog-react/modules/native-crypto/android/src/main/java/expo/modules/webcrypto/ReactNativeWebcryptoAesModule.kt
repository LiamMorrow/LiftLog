package expo.modules.webcrypto

import android.util.Base64
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import javax.crypto.Cipher
import javax.crypto.spec.IvParameterSpec
import javax.crypto.spec.SecretKeySpec

class ReactNativeWebcryptoAesModule : Module() {
  // Each module class must implement the definition function. The definition consists of components
  // that describes the module's functionality and behavior.
  // See https://docs.expo.dev/modules/module-api for more details about available components.
  override fun definition() = ModuleDefinition {
    // Sets the name of the module that JavaScript code will use to refer to the module. Takes a
    // string as an argument.
    // Can be inferred from module's class name, but it's recommended to set it explicitly for
    // clarity.
    // The module will be accessible from `requireNativeModule('ReactNativeWebcryptoAes')` in
    // JavaScript.
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
