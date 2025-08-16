import { NativeModule, requireNativeModule } from 'expo';
import type { webcrypto } from 'node:crypto';

declare class ReactNativeWebcryptoModule extends NativeModule {
  getRandomValues(length: number): Uint8Array;
  sha256(payload: Uint8Array): Promise<Uint8Array>;
  randomUuid(): `${string}-${string}-${string}-${string}-${string}`;
}

// This call loads the native module object from the JSI.
const module = requireNativeModule<ReactNativeWebcryptoModule>(
  'ReactNativeWebcrypto',
);

const Crypto = {
  getRandomValues<T extends ArrayBufferView | null>(arr: T) {
    if (!arr) {
      return arr;
    }
    const bytes = module.getRandomValues(arr.byteLength);
    // Copy the random bytes into the input ArrayBufferView
    if (
      arr instanceof Int8Array ||
      arr instanceof Uint8Array ||
      arr instanceof Uint8ClampedArray ||
      arr instanceof Int16Array ||
      arr instanceof Uint16Array ||
      arr instanceof Int32Array ||
      arr instanceof Uint32Array ||
      arr instanceof Float32Array ||
      arr instanceof Float64Array ||
      arr instanceof DataView
    ) {
      const targetView = new Uint8Array(
        arr.buffer,
        arr.byteOffset,
        arr.byteLength,
      );

      // Ensure we don't exceed the length of either array
      const bytesToCopy = Math.min(bytes.length, targetView.length);

      for (let i = 0; i < bytesToCopy; i++) {
        targetView[i] = bytes[i];
      }
    }

    return arr;
  },

  randomUUID() {
    return module.randomUuid();
  },
  subtle: undefined!,
};

export function sha256Hash(payload: Uint8Array): Promise<Uint8Array> {
  return module.sha256(payload);
}

globalThis.crypto ??= {} as webcrypto.Crypto;
globalThis.crypto.randomUUID = Crypto.randomUUID;
globalThis.crypto.getRandomValues = Crypto.getRandomValues;
export default module;
