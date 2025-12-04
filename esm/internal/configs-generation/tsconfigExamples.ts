// This module must not import any external dependency. It must be runnable without a package.json
import {
  examplesFolderName,
  examplesMark,
  prodFolderName,
  tsConfigSrcFilename,
  tsConfigStyleIncludeForExampleFiles,
  typesFolderName,
} from '../shared-utils/constants.js';
import type { ReadonlyRecord } from '../shared-utils/types.js';

export default {
  extends: './tsconfig.base.json',
  include: [tsConfigStyleIncludeForExampleFiles],
  // The tests project needs to import the source project. The other possibility would be to create a package.json in the examples folder
  references: [{ path: tsConfigSrcFilename }],
  /* NoEmit cannot be set to true in a referenced project even though we never emit anything . rootDir, outDir and declarationDir need to be set otherwise Typescript will complain */
  compilerOptions: {
    tsBuildInfoFile: `.tsbuildinfo/${examplesMark}.tsbuildinfo`,
    rootDir: '.',
    outDir: prodFolderName,
    declarationDir: `${prodFolderName}/${examplesFolderName}/${typesFolderName}`,
    //declarationMap: true
  },
} satisfies ReadonlyRecord;
