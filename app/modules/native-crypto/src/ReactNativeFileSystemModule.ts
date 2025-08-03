import { NativeModule, requireNativeModule } from 'expo';
import { Platform } from 'react-native';

declare class ReactNativeFileSystemModule extends NativeModule {
  getApplicationSupportDirectory(): string;
}

// This call loads the native module object from the JSI.
const module = requireNativeModule<ReactNativeFileSystemModule>(
  'ReactNativeFileSystem',
);

export function getApplicationSupportDirectory(): string {
  if (Platform.OS === 'ios') {
    return module.getApplicationSupportDirectory();
  }
  throw new Error('getApplicationSupportDirectory is only available on iOS');
}
