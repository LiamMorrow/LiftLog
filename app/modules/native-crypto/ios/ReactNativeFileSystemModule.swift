import ExpoModulesCore
import Foundation

public class ReactNativeFileSystemModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ReactNativeFileSystem")

    Function("getApplicationSupportDirectory") { () -> String in
      let urls = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask)
      guard let url = urls.first else {
        throw NSError(domain: "ReactNativeFileSystem", code: 1, userInfo: [NSLocalizedDescriptionKey: "Could not find Application Support directory"])
      }
      return url.path
    }
  }
}
