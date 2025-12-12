import { defineConfig } from 'vitest/config';

export const config = (name: string) =>
  defineConfig({
    test: {
      projects: [
        {
          test: {
            include: ['tests/*.ts'],
            exclude: ['node_modules/**'],
            name: `Repo ${name}`,
            isolate: false,
            fileParallelism: false,
            pool: 'threads',
          },
        },
      ],
    },
  });
