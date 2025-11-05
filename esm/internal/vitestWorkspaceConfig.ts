import { packagesFolderName, testsFolderName, vitestConfigFilename } from '../constants.js'

  // We can define test configs per folder, see Vitest doc
export default `import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  {
    extends: './${vitestConfigFilename}',
    test: {
        name: 'shared',
        include: ['${packagesFolderName}/*/${testsFolderName}/*.test.ts'],
    }
  }
]);`


