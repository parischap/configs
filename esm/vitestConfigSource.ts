import { npmFolderName, testsFolderName } from '@parischap/configs/Constants';
import { defineConfig } from 'vitest/config';

export const config = (name: string) =>
  defineConfig({
    test: {
      projects: [
        {
          test: {
            include: [`${testsFolderName}/*.ts`],
            exclude: [`${npmFolderName}/**`],
            name: `Repo ${name}`,
            isolate: false,
            fileParallelism: false,
            pool: 'threads',
          },
        },
      ],
    },
  });
