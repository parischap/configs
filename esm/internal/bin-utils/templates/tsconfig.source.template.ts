import {
  allJavaScriptFilesInSource,
  prodFolderName,
  sourceFolderName,
  srcMark,
  tsBuildInfoFolderName,
  tsConfigBaseFilename,
  typesFolderName,
} from '../../shared-utils/constants.js';
import type { ReadonlyRecord } from '../../shared-utils/utils.js';

export default {
  compilerOptions: {
    tsBuildInfoFile: `${tsBuildInfoFolderName}/${srcMark}.tsbuildinfo`,
    rootDir: sourceFolderName,
    outDir: `${prodFolderName}/${sourceFolderName}`,
    declarationDir: `${prodFolderName}/${typesFolderName}`,
    // For some reason, Typescript needs to Emit declarations of this project referenced by the tests and examples projects
    noEmit: false,
    emitDeclarationOnly: true,
    //declarationMap: true,
  },
  extends: [`./${tsConfigBaseFilename}`],
  include: allJavaScriptFilesInSource,
} satisfies ReadonlyRecord;
