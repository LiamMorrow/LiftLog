/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
export class FileExportService {
  async exportBytes(
    filename: string,
    bytes: Uint8Array,
    contentType: string,
  ): Promise<void> {
    const blob = new Blob([bytes], { type: contentType });
    const url = URL.createObjectURL(blob);

    const link = (global as any).document.createElement('a');
    link.href = url;
    link.download = filename;
    (global as any).document.body.appendChild(link);
    link.click();
    (global as any).document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
