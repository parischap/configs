// This module must not import any external dependency. It must be runnable without a package.json
import {
  allTsFiles,
  docsFolderName,
  internalFolderName,
  sourceFolderName,
  tsConfigDocGenFilename,
} from '../shared-utils/constants.js';
import type { ReadonlyRecord } from '../shared-utils/types.js';

export default {
  parseCompilerOptions: `./${tsConfigDocGenFilename}`,
  examplesCompilerOptions: `./${tsConfigDocGenFilename}`,
  srcDir: `./${sourceFolderName}`,
  outDir: docsFolderName,
  exclude: [
    ...allTsFiles.map((ext) => `${sourceFolderName}/${internalFolderName}/${ext}`),
    `${sourceFolderName}/index.ts`,
  ],
  enforceDescriptions: true,
  enforceVersion: false,
} satisfies ReadonlyRecord;
