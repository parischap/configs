// This module must not import any external dependency. It must be runnable without a package.json
import {
  prodFolderName,
  srcMark,
  tsConfigStyleIncludeForSourceFiles,
  typesFolderName,
} from '../shared-utils/constants.js';
import type { ReadonlyRecord } from '../shared-utils/types.js';

export default {
  extends: './tsconfig.base.json',
  include: [tsConfigStyleIncludeForSourceFiles],
  /* NoEmit cannot be set to true in a referenced project even though we never emit anything . rootDir, outDir and declarationDir need to be set otherwise Typescript will complain */
  compilerOptions: {
    tsBuildInfoFile: `.tsbuildinfo/${srcMark}.tsbuildinfo`,
    rootDir: '.',
    outDir: prodFolderName,
    declarationDir: `${prodFolderName}/${typesFolderName}`,
    // For some reason, Typescript needs to Emit declarations of this project referenced by the tests and examples projects
    noEmit: false,
    emitDeclarationOnly: true,
    //declarationMap: true,
  },
} satisfies ReadonlyRecord;
