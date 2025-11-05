// This module must not import any external dependency. It must be runnable without a package.json
import {
  allTsFiles,
  docsFolderName,
  internalFolderName,
  projectFolderName,
  tsConfigDocGenFilename,
} from '../constants.js';
import type { ReadonlyRecord } from "../types.js";

const _default:ReadonlyRecord = {
  parseCompilerOptions: `./${tsConfigDocGenFilename}`,
  examplesCompilerOptions: `./${tsConfigDocGenFilename}`,
  srcDir: `./${projectFolderName}`,
  outDir: docsFolderName,
  exclude: [
    ...allTsFiles.map((ext) => `${projectFolderName}/${internalFolderName}/${ext}`),
    `${projectFolderName}/index.ts`,
  ],
  enforceDescriptions: true,
  enforceVersion: false,
};

export default _default