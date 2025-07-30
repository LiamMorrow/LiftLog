export class KeyValueStore {
  async getItem(key: string): Promise<string | undefined> {
    return window.localStorage.getItem(key) ?? undefined;
  }

  async getItemBytes(key: string): Promise<Uint8Array | undefined> {
    let item = window.localStorage.getItem(key);
    if (item?.startsWith('"') && item.endsWith('"')) {
      item = item.slice(1, -1);
    }
    return item
      ? Uint8Array.from(atob(item), (char) => char.charCodeAt(0))
      : undefined;
  }

  async setItem(key: string, value: string | Uint8Array): Promise<void> {
    if (typeof value === 'string') {
      window.localStorage.setItem(key, value);
    } else {
      const base64Value = btoa(String.fromCharCode(...value));
      window.localStorage.setItem(key, base64Value);
    }
  }

  async removeItem(key: string): Promise<void> {
    window.localStorage.removeItem(key);
  }
}
