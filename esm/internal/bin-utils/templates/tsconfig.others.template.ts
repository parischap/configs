import { extname } from 'node:path';
import {
  filesGeneratedByThirdParties,
  foldersWithoutConfigFiles,
  javaScriptExtensions,
  othersFolderName,
  othersMark,
  prodFolderName,
  tsBuildInfoFolderName,
  tsConfigBaseFilename,
  typesFolderName,
} from '../../shared-utils/constants.js';
import { type ReadonlyRecord } from '../../shared-utils/utils.js';

// Must work at all levels: top, monorepo, one-package repo, subrepo
export default {
  extends: [`./${tsConfigBaseFilename}`],
  exclude: [
    ...foldersWithoutConfigFiles,
    ...filesGeneratedByThirdParties.filter((file) => javaScriptExtensions.includes(extname(file))),
  ],
  compilerOptions: {
    tsBuildInfoFile: `${tsBuildInfoFolderName}/${othersMark}.tsbuildinfo`,
    rootDir: '.',
    outDir: `${prodFolderName}/${othersFolderName}`,
    declarationDir: `${prodFolderName}/${othersFolderName}/${typesFolderName}`,
    //declarationMap: true
  },
} satisfies ReadonlyRecord;
