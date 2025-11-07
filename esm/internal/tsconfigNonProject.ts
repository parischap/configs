// This module must not import any external dependency. It must be runnable without a package.json
import {
  npmFolderName,
  othersFolderName,
  prodFolderName,
  projectFolderName,
  viteTimeStampFilenamePattern,
} from '../constants.js';
import type { ReadonlyRecord } from '../types.js';

const _default: ReadonlyRecord = {
  extends: './tsconfig.base.json',
  exclude: [projectFolderName, npmFolderName, prodFolderName, viteTimeStampFilenamePattern],
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

export default _default;
