// This module must not import any external dependency. It must be runnable without a package.json
export default (packageName: string) => `import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          include: ['tests/*.ts'],
          exclude: ['node_modules/**'],
          name: 'Repo ${packageName}',
          isolate: false,
          fileParallelism: false,
          pool: 'threads',
        },
      },
    ],
  },
});`;
