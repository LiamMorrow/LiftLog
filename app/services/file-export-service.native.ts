import { File, Paths } from 'expo-file-system';
import { shareAsync } from 'expo-sharing';

export class FileExportService {
  async exportBytes(
    filename: string,
    bytes: Uint8Array,
    contentType: string,
  ): Promise<void> {
    const file = new File(Paths.join(Paths.cache, filename));
    if (file.exists) {
      file.delete();
    }
    file.create();
    const stream = file.writableStream();
    const writer = stream.getWriter();
    await writer.write(bytes);
    await writer.close();
    await shareAsync(file.uri, {
      dialogTitle: 'Export data',
      mimeType: contentType,
    });
  }
}
