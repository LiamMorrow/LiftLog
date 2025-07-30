import * as DocumentPicker from 'expo-document-picker';
export type PickedFile = {
  bytes: Uint8Array;
  name: string;
};
export class FilePickerService {
  async pickFile(): Promise<PickedFile | undefined> {
    const picked = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
      multiple: false,
    });
    if (picked.canceled) {
      return undefined;
    }
    const pickedItem = picked.assets[0];
    const bytes = await pickedItem.file?.arrayBuffer();
    if (!bytes) {
      return undefined;
    }
    return {
      name: pickedItem.name,
      bytes: new Uint8Array(bytes),
    };
  }
}
