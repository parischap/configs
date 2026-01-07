import {
  prodFolderName,
  testsFolderName,
  testsMark,
  tsBuildInfoFolderName,
  tsConfigBaseFilename,
  tsConfigSrcFilename,
  tsConfigStyleIncludeForTestsFiles,
  typesFolderName,
} from '../../shared-utils/constants.js';
import { type ReadonlyRecord } from '../../shared-utils/utils.js';

export default {
  extends: [`./${tsConfigBaseFilename}`],
  include: [tsConfigStyleIncludeForTestsFiles],
  // The tests project needs to import the source project. The other possibility would be to create a package.json in the tests folder
  references: [{ path: tsConfigSrcFilename }],
  compilerOptions: {
    tsBuildInfoFile: `${tsBuildInfoFolderName}/${testsMark}.tsbuildinfo`,
    rootDir: '.',
    outDir: prodFolderName,
    declarationDir: `${prodFolderName}/${testsFolderName}/${typesFolderName}`,
    //declarationMap: true,
  },
} satisfies ReadonlyRecord;
