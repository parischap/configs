import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          include: ['tests/*.ts'],
          exclude: ['node_modules/**'],
          name: 'Repo configs',
          isolate: false,
          fileParallelism: false,
          pool: 'threads',
        },
      },
    ],
  },
});
