import {
  allFilesPattern,
  binariesFolderName,
  docsFolderName,
  internalFolderName,
  sourceFolderName,
  tsConfigDocGenFilename,
} from '../../shared-utils/constants.js';
import type { ReadonlyRecord } from '../../shared-utils/utils.js';

export default {
  enforceDescriptions: true,
  enforceVersion: false,
  examplesCompilerOptions: `./${tsConfigDocGenFilename}`,
  exclude: [
    `${sourceFolderName}/${internalFolderName}/${allFilesPattern}`,
    `${sourceFolderName}/${binariesFolderName}/${allFilesPattern}`,
    `${sourceFolderName}/index.ts`,
  ],
  outDir: docsFolderName,
  parseCompilerOptions: `./${tsConfigDocGenFilename}`,
  srcDir: `./${sourceFolderName}`,
} satisfies ReadonlyRecord;
