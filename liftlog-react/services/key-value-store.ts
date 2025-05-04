export interface IKeyValueStore {
  getItem(key: string): Promise<string | undefined>;
  getItemBytes(key: string): Promise<Uint8Array | undefined>;
  setItem(key: string, value: string | Uint8Array): Promise<void>;
  removeItem(key: string): Promise<void>;
}
