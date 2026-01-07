/* Although it is possible to have the vitest configuration inside the vite configuration files, this is usually not a good idea. The vite configuration is useful for bundling whereas the vitest configuration is useful for testing */
import { basename } from 'node:path';
import { defineConfig } from 'vitest/config';
import { npmFolderName, testsFolderName } from '../../../shared-utils/constants.js';

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          include: [`${testsFolderName}/*.ts`],
          exclude: [`${npmFolderName}/**`],
          name: `Repo ${basename(import.meta.dirname)}`,
          isolate: false,
          fileParallelism: false,
          pool: 'threads',
        },
      },
    ],
  },
});
