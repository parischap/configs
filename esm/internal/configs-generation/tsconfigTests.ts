// This module must not import any external dependency. It must be runnable without a package.json
import {
  prodFolderName,
  testsFolderName,
  testsMark,
  tsConfigSrcFilename,
  tsConfigStyleIncludeForTestsFiles,
  typesFolderName,
} from '../shared-utils/constants.js';
import type { ReadonlyRecord } from '../shared-utils/types.js';

export default {
  extends: './tsconfig.base.json',
  include: [tsConfigStyleIncludeForTestsFiles],
  // The tests project needs to import the source project. The other possibility would be to create a package.json in the tests folder
  references: [{ path: tsConfigSrcFilename }],
  /* NoEmit cannot be set to true in a referenced project even though we never emit anything . rootDir, outDir and declarationDir need to be set otherwise Typescript will complain */
  compilerOptions: {
    tsBuildInfoFile: `.tsbuildinfo/${testsMark}.tsbuildinfo`,
    rootDir: '.',
    outDir: prodFolderName,
    declarationDir: `${prodFolderName}/${testsFolderName}/${typesFolderName}`,
    //declarationMap: true,
  },
} satisfies ReadonlyRecord;
