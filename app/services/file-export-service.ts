export class FileExportService {
  async exportBytes(
    filename: string,
    bytes: Uint8Array,
    contentType: string,
  ): Promise<void> {
    // TODO download file
    const blob = new Blob([bytes], { type: contentType });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
