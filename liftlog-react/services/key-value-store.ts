export class KeyValueStore {
  //TODO
  async getItem(key: string): Promise<string | undefined> {
    return undefined;
  }
  async getItemBytes(key: string): Promise<Buffer | undefined> {
    return undefined;
  }

  async removeItem(key: string) {}

  async setItem(key: string, value: string | Buffer) {}
}
