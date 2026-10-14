import { defineConfig, Plugin } from 'vitest/config';
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
  resolveId(id) {
    if (id === 'expo-sqlite' || id.startsWith('expo-sqlite/')) {
      return resolve(__dirname, 'test/shims/expo-sqlite.ts');
    }
  },
};

export default defineConfig({
  // Metro injects this; without it anything importing `services/api-consts` throws on load.
  define: { __DEV__: 'false' },
  test: {
    globals: false,
    environment: 'jsdom',
    include: ['**/*.spec.ts', '**/*.spec.tsx'],
    setupFiles: ['./test/setup.ts'],
    server: { deps: { inline: [/drizzle-orm\/expo-sqlite/] } },
    coverage: {
      provider: 'v8',
      reporter: ['text-summary', 'html', 'json-summary'],
      include: [
        'src/models/**/*.{ts,tsx}',
        'src/services/**/*.{ts,tsx}',
        'src/store/**/*.{ts,tsx}',
        'src/utils/**/*.{ts,tsx}',
        'src/hooks/**/*.{ts,tsx}',
      ],
      exclude: [
        '**/*.spec.{ts,tsx}',
        'src/**/__test__/**',
        'src/**/__tests__/**',
        'src/**/test-assets/**',
        'src/gen/**',
        'src/drizzle/**',
      ],
    },
  },
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [sqlShim, expoSqliteShim],
});
