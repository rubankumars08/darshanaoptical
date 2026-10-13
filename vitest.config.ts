import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  // Resolves the "@/*" alias from tsconfig.json so tests can import app modules
  // by the same specifier the application uses.
  plugins: [tsconfigPaths()],
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    setupFiles: ['tests/setup.ts'],
    restoreMocks: true,
    testTimeout: 20_000, // scrypt hashing is deliberately slow
  },
});
