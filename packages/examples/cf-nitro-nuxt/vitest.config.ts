
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    testTimeout: 60000,
    exclude: ['**/e2e.spec.ts'],
    include: ['tests/unit.spec.ts'],
  },
});
