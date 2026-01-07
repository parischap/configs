import {
  examplesFolderName,
  examplesMark,
  prodFolderName,
  tsBuildInfoFolderName,
  tsConfigBaseFilename,
  tsConfigSrcFilename,
  tsConfigStyleIncludeForExampleFiles,
  typesFolderName,
} from '../../../shared-utils/constants.js';
import { type ReadonlyRecord } from '../../../shared-utils/utils.js';

export default {
  extends: [`./${tsConfigBaseFilename}`],
  include: [tsConfigStyleIncludeForExampleFiles],
  // The examples project needs to import the source project. The other possibility would be to create a package.json in the tests folder
  references: [{ path: tsConfigSrcFilename }],
  compilerOptions: {
    tsBuildInfoFile: `${tsBuildInfoFolderName}/${examplesMark}.tsbuildinfo`,
    rootDir: '.',
    outDir: prodFolderName,
    declarationDir: `${prodFolderName}/${examplesFolderName}/${typesFolderName}`,
    //declarationMap: true
  },
} satisfies ReadonlyRecord;
