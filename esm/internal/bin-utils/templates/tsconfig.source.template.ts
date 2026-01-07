import {
  prodFolderName,
  srcMark,
  tsBuildInfoFolderName,
  tsConfigBaseFilename,
  tsConfigStyleIncludeForSourceFiles,
  typesFolderName,
} from '../../shared-utils/constants.js';
import { type ReadonlyRecord } from '../../shared-utils/utils.js';

export default {
  extends: [`./${tsConfigBaseFilename}`],
  include: [tsConfigStyleIncludeForSourceFiles],
  compilerOptions: {
    tsBuildInfoFile: `${tsBuildInfoFolderName}/${srcMark}.tsbuildinfo`,
    rootDir: '.',
    outDir: prodFolderName,
    declarationDir: `${prodFolderName}/${typesFolderName}`,
    // For some reason, Typescript needs to Emit declarations of this project referenced by the tests and examples projects
    noEmit: false,
    emitDeclarationOnly: true,
    //declarationMap: true,
  },
} satisfies ReadonlyRecord;
