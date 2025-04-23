import { File, Paths } from 'expo-file-system/next';

export class KeyValueStore {
  async getItem(key: string): Promise<string | undefined> {
    const file = getFile(key);
    if (file.exists) {
      return file.text();
    }
    return undefined;
  }

  async getItemBytes(key: string): Promise<Uint8Array | undefined> {
    const file = getFile(key);
    if (file.exists) {
      return file.bytes();
    }
    return undefined;
  }

  async setItem(key: string, value: string | Uint8Array) {
    const file = getFile(key);
    file.write(value);
  }

  async removeItem(key: string) {
    const file = getFile(key);
    if (file.exists) {
      file.delete();
    }
  }
}

//TODO - Verify this is the same as the MAUI path on iOS - it is on android :)
function getFile(key: string): File {
  return new File(Paths.join(Paths.document, key));
}
