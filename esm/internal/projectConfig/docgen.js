import {
  allTsFiles,
  docgenTsConfigFileName,
  docsFolderName,
  internalFolderName,
  projectFolderName,
} from './constants.js';
/**
 * @import {ReadonlyRecord} from "./types.d.ts"
 */

/**
 * @type ReadonlyRecord
 */
export default {
  parseCompilerOptions: `./${docgenTsConfigFileName}`,
  examplesCompilerOptions: `./${docgenTsConfigFileName}`,
  srcDir: `./${projectFolderName}`,
  outDir: docsFolderName,
  exclude: [
    ...allTsFiles.map((ext) => `${projectFolderName}/${internalFolderName}/${ext}`),
    `${projectFolderName}/index.ts`,
  ],
  enforceDescriptions: true,
  enforceVersion: false,
};
