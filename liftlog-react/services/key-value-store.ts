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
    if (typeof value === 'string') {
      file.write(value);
      return;
    }
    const str = file.writableStream();
    const writer = str.getWriter();
    try {
      await writer.write(value);
    } finally {
      writer.close();
    }
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
