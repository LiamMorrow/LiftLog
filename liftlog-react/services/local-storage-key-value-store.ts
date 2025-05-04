import { IKeyValueStore } from '@/services/key-value-store';

export class FileKeyValueStore implements IKeyValueStore {
  async getItem(key: string): Promise<string | undefined> {
    return localStorage.getItem(key) ?? undefined;
  }

  async getItemBytes(key: string): Promise<Uint8Array | undefined> {
    const item = localStorage.getItem(key);
    return item
      ? Uint8Array.from(atob(item), (char) => char.charCodeAt(0))
      : undefined;
  }

  async setItem(key: string, value: string | Uint8Array): Promise<void> {
    if (typeof value === 'string') {
      localStorage.setItem(key, value);
    } else {
      const base64Value = btoa(String.fromCharCode(...value));
      localStorage.setItem(key, base64Value);
    }
  }

  async removeItem(key: string): Promise<void> {
    localStorage.removeItem(key);
  }
}
