import {
  allJavaScriptFilesInExamples,
  examplesMark,
  prodFolderName,
  tsBuildInfoFolderName,
  tsConfigBaseFilename,
  tsConfigSourceFilename,
  typesFolderName,
} from '../../shared-utils/constants.js';
import type { ReadonlyRecord } from '../../shared-utils/utils.js';

export default {
  extends: [`./${tsConfigBaseFilename}`],
  include: allJavaScriptFilesInExamples,
  // The examples project needs to import the source project. The other possibility would be to create a package.json in the tests folder
  references: [{ path: tsConfigSourceFilename }],
  compilerOptions: {
    declarationDir: `${prodFolderName}/${typesFolderName}`,
    outDir: prodFolderName,
    tsBuildInfoFile: `${tsBuildInfoFolderName}/${examplesMark}.tsbuildinfo`,
  },
} satisfies ReadonlyRecord;
