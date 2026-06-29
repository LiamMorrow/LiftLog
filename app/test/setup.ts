// test/setup.ts
import { vi } from 'vitest';

vi.mock('react-native', () => ({}));
vi.mock('react-native-reanimated', () => ({}));
vi.mock('react-native-gesture-handler', () => ({}));
vi.mock('expo-localization', () => ({}));
vi.mock('expo', () => ({
  requireNativeModule: () => {
    {}
  },
}));
// In your existing test/setup.ts, add:

const fileStore = new Map<string, string>();

vi.mock('expo-file-system', () => {
  class File {
    private path: string;

    constructor(path: string) {
      this.path = path;
    }

    get exists(): boolean {
      return fileStore.has(this.path);
    }

    text(): Promise<string> {
      return Promise.resolve(fileStore.get(this.path) ?? '');
    }

    create(): void {}

    write(content: string): void {
      fileStore.set(this.path, content);
    }

    delete(): void {
      fileStore.delete(this.path);
    }

    async move(target: File, _options?: { overwrite?: boolean }): Promise<void> {
      const content = fileStore.get(this.path) ?? '';
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
      fileStore.set((target as any).path, content);
      fileStore.delete(this.path);
    }
  }

  const Paths = {
    document: '/mock/documents',
    join: (...parts: string[]) => parts.join('/'),
  };

  return { File, Paths };
});
