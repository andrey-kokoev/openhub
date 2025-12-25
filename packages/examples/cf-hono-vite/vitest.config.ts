import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Run tests in a single thread (equivalent to old singleThread: true)
    // This makes Vitest wait properly for async operations to complete
    // before exiting the process (key fix for VS Code Testing panel)
    maxWorkers: 1,

    // Optional: Force the 'threads' pool (default is 'forks' in some cases)
    // Use 'threads' for better async behavior in single-worker mode
    pool: 'threads',

    // If you need to disable isolation (rarely needed, but can help with shared state)
    // isolate: false,

    testTimeout: 60000,
    exclude: ['**/e2e.spec.ts'],
    include: ['tests/unit.spec.ts'],
  },
})
