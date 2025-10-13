import * as constants from './constants.js';
export default {
  parseCompilerOptions: `./${constants.docgenTsConfigFileName}`,
  examplesCompilerOptions: `./${constants.docgenTsConfigFileName}`,
  srcDir: `./${constants.projectFolderName}`,
  outDir: constants.docsFolderName,
  exclude: [
    ...constants.allTsFiles.map(
      (ext) => `${constants.projectFolderName}/${constants.internalFolderName}/${ext}`,
    ),
    `${constants.projectFolderName}/index.ts`,
  ],
  enforceDescriptions: true,
  enforceVersion: false,
};
