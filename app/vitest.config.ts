import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  test: {
    globals: false,
    environment: 'jsdom',
    include: ['**/*.spec.ts', '**/*.spec.tsx'],
    setupFiles: ['./test/setup.ts'],
  },
  plugins: [tsconfigPaths()],
});
