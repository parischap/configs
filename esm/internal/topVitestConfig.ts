// This module must not import any external dependency. It must be runnable without a package.json
export default `import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          include: ['**/tests/*.ts'],
          // it is recommended to define a name when using inline configs
          name: 'general',
          isolate: false,
          fileParallelism: false,
          pool: 'threads',
        },
      },
    ],
  },
});`;
