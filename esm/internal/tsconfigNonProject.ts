// This module must not import any external dependency. It must be runnable without a package.json
import {
  allProjectFolders,
  nonProjectMark,
  npmFolderName,
  packagesFolderName,
  prodFolderName,
  viteTimeStampFilenamePattern,
} from '../constants.js';
import type { ReadonlyRecord } from '../types.js';

// Must work at all levels: top, monorepo, one-package repo, subrepo
export default {
  extends: './tsconfig.base.json',
  exclude: [
    ...allProjectFolders,
    npmFolderName,
    prodFolderName,
    packagesFolderName,
    viteTimeStampFilenamePattern,
  ],
  compilerOptions: {
    /**
     * Need to define rootDir and outDir even if project is not meant to be built with tsc.
     * Otherwise, we get an 'Cannot write file... because it would overwrite input file.' error
     */
    rootDir: '.',
    outDir: `${prodFolderName}/${nonProjectMark}`,
    lib: ['ESNext'],
    types: ['node'],
    allowJs: true,
    checkJs: true,
  },
} satisfies ReadonlyRecord;
