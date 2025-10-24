// Whatever external package this file uses must be added as peerDependency
import {
  npmFolderName,
  othersFolderName,
  prodFolderName,
  projectFolderName,
  viteTimeStampFileNamePattern,
} from './constants.js';
/**
 * @import {ReadonlyRecord} from "./types.d.ts"
 */

/**
 * @type ReadonlyRecord
 */
export default {
  extends: './tsconfig.base.json',
  exclude: [projectFolderName, npmFolderName, prodFolderName, viteTimeStampFileNamePattern],
  compilerOptions: {
    /**
     * Need to define rootDir and outDir even if project is not meant to be built with tsc.
     * Otherwise, we get an 'Cannot write file... because it would overwrite input file.' error
     */
    rootDir: '.',
    outDir: `${prodFolderName}/${othersFolderName}`,
    lib: ['ESNext'],
    types: ['node'],
    allowJs: true,
    checkJs: true,
  },
};
