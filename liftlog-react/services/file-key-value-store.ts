import { IKeyValueStore } from '@/services/key-value-store';
import { File, Paths } from 'expo-file-system/next';

export class FileKeyValueStore implements IKeyValueStore {
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

  async setItem(key: string, value: string | Uint8Array): Promise<void> {
    const file = getFile(key);
    if (!file.exists) {
      file.create();
    }
    if (typeof value === 'string') {
      file.write(value);
      return;
    }
    const str = file.writableStream();
    const writer = str.getWriter();
    try {
      await writer.write(value);
    } finally {
      await writer.close();
    }
  }

  async removeItem(key: string): Promise<void> {
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
