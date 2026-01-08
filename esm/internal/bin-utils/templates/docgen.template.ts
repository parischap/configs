import {
  allFilesPattern,
  binariesFolderName,
  docsFolderName,
  internalFolderName,
  sourceFolderName,
  tsConfigDocGenFilename,
} from '../../shared-utils/constants.js';
import { type ReadonlyRecord } from '../../shared-utils/utils.js';

export default {
  parseCompilerOptions: `./${tsConfigDocGenFilename}`,
  examplesCompilerOptions: `./${tsConfigDocGenFilename}`,
  srcDir: `./${sourceFolderName}`,
  outDir: docsFolderName,
  exclude: [
    `${sourceFolderName}/${internalFolderName}/${allFilesPattern}`,
    `${sourceFolderName}/${binariesFolderName}/${allFilesPattern}`,
    `${sourceFolderName}/index.ts`,
  ],
  enforceDescriptions: true,
  enforceVersion: false,
} satisfies ReadonlyRecord;
