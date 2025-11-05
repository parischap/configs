// This module must not import any external dependency. It must be runnable without a package.json
import {
  allTsFiles,
  docsFolderName,
  internalFolderName,
  projectFolderName,
  tsConfigDocGenFileName,
} from '../constants.js';
/** @import {ReadonlyRecord} from "../types.js" */

/** @type ReadonlyRecord */
export default {
  parseCompilerOptions: `./${tsConfigDocGenFileName}`,
  examplesCompilerOptions: `./${tsConfigDocGenFileName}`,
  srcDir: `./${projectFolderName}`,
  outDir: docsFolderName,
  exclude: [
    ...allTsFiles.map((ext) => `${projectFolderName}/${internalFolderName}/${ext}`),
    `${projectFolderName}/index.ts`,
  ],
  enforceDescriptions: true,
  enforceVersion: false,
};
