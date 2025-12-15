import { defineConfig } from 'vitest/config';
import { packagesFolderName } from './internal/shared-utils/constants.js';

export const config = defineConfig({
  test: {
    projects: [`${packagesFolderName}/*`],
  },
});
