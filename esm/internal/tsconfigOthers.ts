import * as constants from './constants.js';

export default {
  extends: './tsconfig.base.json',
  exclude: [
    constants.projectFolderName,
    constants.npmFolderName,
    constants.prodFolderName,
    constants.viteTimeStampFileNamePattern,
  ],
  compilerOptions: {
    /**
     * Need to define rootDir and outDir even if project is not meant to be built with tsc.
     * Otherwise, we get an 'Cannot write file... because it would overwrite input file.' error
     */
    rootDir: '.',
    outDir: `${constants.prodFolderName}/${constants.othersFolderName}`,
    lib: ['ESNext'],
    types: ['node'],
    allowJs: true,
    checkJs: true,
  },
};
