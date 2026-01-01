import { uuid } from '@/utils/uuid';
import { File, Paths } from 'expo-file-system';
import { Platform } from 'react-native';
import { getLibraryDirectory } from '@/modules/native-crypto';

export class KeyValueStore {
  async getItem(key: string): Promise<string | undefined> {
    const file = getFile(key);
    if (file.exists) {
      return file.text();
    }
    const oldFile = getOldDirFile(key);
    if (oldFile?.exists) {
      return oldFile.text();
    }
    return undefined;
  }

  async getItemBytes(key: string): Promise<Uint8Array | undefined> {
    const file = getFile(key);
    if (file.exists) {
      return this.readBytes(file);
    }
    const oldFile = getOldDirFile(key);
    if (oldFile?.exists) {
      return this.readBytes(oldFile);
    }
    return undefined;
  }

  async setItem(key: string, value: string | Uint8Array): Promise<void> {
    // We do this tempfile business to catch if the app crashes halfway through a write, don't want to corrupt the existing data.
    // Originally I found that if the value was < the original file length then it kept the old files extra data -corrupting it.
    // Could just delete it, but this feels like less chance of data loss
    const tempFile = getFile(key + '-tmp' + uuid());
    const finalFile = getFile(key);
    tempFile.create();

    if (typeof value === 'string') {
      tempFile.write(value);
      if (finalFile.exists) {
        finalFile.delete();
      }
      tempFile.move(finalFile);
      return;
    }
    const stream = tempFile.writableStream();
    const writer = stream.getWriter();
    try {
      await writer.write(value);
    } finally {
      await writer.close();
    }
    if (finalFile.exists) {
      finalFile.delete();
    }
    tempFile.move(finalFile);
  }

  getItemSync(key: string): string | undefined {
    const file = getFile(key);
    if (file.exists) {
      return file.textSync();
    }
    const oldFile = getOldDirFile(key);
    if (oldFile?.exists) {
      return oldFile.textSync();
    }
    return undefined;
  }

  async removeItem(key: string): Promise<void> {
    const file = getFile(key);
    if (file.exists) {
      file.delete();
    }
  }

  private async readBytes(file: File): Promise<Uint8Array> {
    const readBytes = new Uint8Array(file.size);
    let offset = 0;
    // This is probably slower than just using sync file.read, but it won't lock the UI thread...
    for await (const bytesAny of file.readableStream().values()) {
      const bytes = bytesAny as Uint8Array;
      readBytes.set(bytes, offset);
      offset += bytes.length;
    }
    return readBytes;
  }
}

function getOldDirFile(key: string): File | undefined {
  // For iOS, the Library/Application Support directory (equivalent to .NET MAUI's FileSystem.AppDataDirectory)
  // We want to only read from this, and store in the appropriate documents dir
  if (Platform.OS === 'ios' || Platform.OS === 'macos') {
    const libraryDir = getLibraryDirectory();
    return new File(Paths.join(libraryDir, key));
  } else {
    return undefined;
  }
}

function getFile(key: string): File {
  return new File(Paths.join(Paths.document, key));
}
