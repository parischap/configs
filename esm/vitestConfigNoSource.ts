// constant.js is imported using exports definition in package.json so vitest is able to follow the link
import { packagesFolderName } from '@parischap/configs/Constants';
import { defineConfig } from 'vitest/config';

export const config = defineConfig({
  test: {
    projects: [`${packagesFolderName}/*`],
  },
});
