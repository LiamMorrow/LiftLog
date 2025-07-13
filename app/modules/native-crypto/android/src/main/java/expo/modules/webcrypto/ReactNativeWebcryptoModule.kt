package expo.modules.webcrypto

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.util.UUID
import kotlin.random.Random
import java.security.MessageDigest

class ReactNativeWebcryptoModule : Module() {
  // Each module class must implement the definition function. The definition consists of components
  // that describes the module's functionality and behavior.
  // See https://docs.expo.dev/modules/module-api for more details about available components.
  override fun definition() = ModuleDefinition {
    // Sets the name of the module that JavaScript code will use to refer to the module. Takes a
    // string as an argument.
    // Can be inferred from module's class name, but it's recommended to set it explicitly for
    // clarity.
    // The module will be accessible from `requireNativeModule('ReactNativeWebcrypto')` in
    // JavaScript.
    Name("ReactNativeWebcrypto")

    // Returns a random UUID string
    Function("randomUuid") { UUID.randomUUID().toString() }

    // Returns an array of random bytes of the given length
    Function("getRandomValues") { length: Int ->
      val bytes = ByteArray(length)
      Random.Default.nextBytes(bytes)
      bytes
    }

    AsyncFunction("sha256") { payload: ByteArray ->
      val digest = MessageDigest.getInstance("SHA-256")
      digest.digest(payload)
    }
  }
}
