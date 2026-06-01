import { defineConfig, Plugin } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';
import { resolve } from 'path';
const sqlShim: Plugin = {
  name: 'sql-files',
  enforce: 'pre',
  transform(code, id) {
    if (id.endsWith('.sql') || id.includes('.sql?')) {
      return `export default ${JSON.stringify(code)};`;
    }
  },
};
const expoSqliteShim: Plugin = {
  name: 'expo-sqlite-shim',
  enforce: 'pre',
  resolveId(id, importer) {
    if (id === 'drizzle-orm/expo-sqlite') {
      return this.resolve('drizzle-orm/libsql', importer, {
        skipSelf: true,
      });
    }
    if (id === 'drizzle-orm/expo-sqlite/migrator') {
      return resolve(__dirname, 'test/shims/migrator.ts');
    }
    if (
      id === 'expo-sqlite' ||
      id.startsWith('expo-sqlite/') ||
      id.includes('expo-sqlite')
    ) {
      return resolve(__dirname, 'test/shims/expo-sqlite.ts');
    }
  },
};

export default defineConfig({
  test: {
    globals: false,
    environment: 'jsdom',
    include: ['**/*.spec.ts', '**/*.spec.tsx'],
    setupFiles: ['./test/setup.ts'],
  },
  plugins: [sqlShim, expoSqliteShim, tsconfigPaths()],
});
