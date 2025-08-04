import ExpoModulesCore
import Foundation

public class ReactNativeFileSystemModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ReactNativeFileSystem")

    Function("getLibraryDirectory") { () -> String in
      let urls = FileManager.default.urls(for: .libraryDirectory, in: .userDomainMask)
      guard let url = urls.first else {
        throw NSError(domain: "ReactNativeFileSystem", code: 1, userInfo: [NSLocalizedDescriptionKey: "Could not find Library directory"])
      }
      return url.path
    }
  }
}
