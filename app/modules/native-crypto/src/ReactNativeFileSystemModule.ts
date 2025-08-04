import { NativeModule, requireNativeModule } from 'expo';
import { Platform } from 'react-native';

declare class ReactNativeFileSystemModule extends NativeModule {
  getLibraryDirectory(): string;
}

export function getLibraryDirectory(): string {
  if (Platform.OS === 'ios') {
    // This call loads the native module object from the JSI.
    const module = requireNativeModule<ReactNativeFileSystemModule>(
      'ReactNativeFileSystem',
    );

    return module.getLibraryDirectory();
  }
  throw new Error('getLibraryDirectory is only available on iOS');
}
