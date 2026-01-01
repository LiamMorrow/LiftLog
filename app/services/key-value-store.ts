type Global = {
  window: Window;
};
type Window = {
  localStorage: LocalStorage;
};

type LocalStorage = {
  getItem(key: string): string;
  removeItem(key: string): void;
  setItem(key: string, value: string): void;
};
export class KeyValueStore {
  async getItem(key: string): Promise<string | undefined> {
    return (
      (global as unknown as Global).window.localStorage.getItem(key) ??
      undefined
    );
  }

  getItemSync(key: string): string | undefined {
    return (
      (global as unknown as Global).window.localStorage.getItem(key) ??
      undefined
    );
  }

  async getItemBytes(key: string): Promise<Uint8Array | undefined> {
    let item = (global as unknown as Global).window.localStorage.getItem(key);
    if (item?.startsWith('"') && item.endsWith('"')) {
      item = item.slice(1, -1);
    }
    return item
      ? Uint8Array.from(atob(item), (char) => char.charCodeAt(0))
      : undefined;
  }

  async setItem(key: string, value: string | Uint8Array): Promise<void> {
    if (typeof value === 'string') {
      (global as unknown as Global).window.localStorage.setItem(key, value);
    } else {
      // Convert Uint8Array to base64 without creating a massive stack by spreading into fromCharCode
      function uint8ToBase64(bytes: Uint8Array): string {
        let binary = '';
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
      }
      const base64Value = uint8ToBase64(value);
      (global as unknown as Global).window.localStorage.setItem(
        key,
        base64Value,
      );
    }
  }

  async removeItem(key: string): Promise<void> {
    (global as unknown as Global).window.localStorage.removeItem(key);
  }
}
