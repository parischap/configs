/* Although it is possible to have the vitest configuration inside the vite configuration files, this is usually not a good idea. The vite configuration is useful for bundling whereas the vitest configuration is useful for testing */
import { defineConfig } from 'vitest/config';
/* @ts-expect-error Must only use Typescript syntax understandable by Node with the --experimental-transform-types flag */
import { npmFolderName, testsFolderName } from '../../shared-utils/constants.ts';

export default (name: string) =>
  defineConfig({
    test: {
      exclude: [`./**/${npmFolderName}/**`],
      fileParallelism: false,
      include: [`./**/${testsFolderName}/**/*.ts`],
      isolate: false,
      name: `Repo ${name}`,
      pool: 'threads',
    },
  });
