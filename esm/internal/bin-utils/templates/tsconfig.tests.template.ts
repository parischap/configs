import {
  allJavaScriptFilesInTests,
  prodFolderName,
  testsMark,
  tsBuildInfoFolderName,
  tsConfigBaseFilename,
  tsConfigSourceFilename,
  typesFolderName,
} from '../../shared-utils/constants.js';
import type { ReadonlyRecord } from '../../shared-utils/utils.js';

export default {
  extends: [`./${tsConfigBaseFilename}`],
  include: allJavaScriptFilesInTests,
  // The tests project needs to import the source project. The other possibility would be to create a package.json in the tests folder
  references: [{ path: tsConfigSourceFilename }],
  compilerOptions: {
    declarationDir: `${prodFolderName}/${typesFolderName}`,
    outDir: prodFolderName,
    tsBuildInfoFile: `${tsBuildInfoFolderName}/${testsMark}.tsbuildinfo`,
  },
} satisfies ReadonlyRecord;
