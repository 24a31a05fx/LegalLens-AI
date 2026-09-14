import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    passWithNoTests: true,
    include: ['**/*.test.ts'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    coverage: {
      reporter: ['text', 'json', 'html'],
    },
  },
  resolve: {
    alias: {
      '@legallens/ai': fileURLToPath(new URL('./packages/ai/src/index.ts', import.meta.url)),
      '@legallens/logger': fileURLToPath(new URL('./packages/logger/src/index.ts', import.meta.url)),
      '@legallens/security': fileURLToPath(new URL('./packages/security/src/index.ts', import.meta.url)),
      '@legallens/shared-types': fileURLToPath(new URL('./packages/shared-types/src/index.ts', import.meta.url)),
    },
  },
});
