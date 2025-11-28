// This module must not import any external dependency. It must be runnable without a package.json
import {
  allProjectFilesWithoutExtensions,
  prodFolderName,
  sourceFolderName,
  typesFolderName,
} from '../constants.js';
import type { ReadonlyRecord } from '../types.js';

export default {
  extends: './tsconfig.base.json',
  include: allProjectFilesWithoutExtensions,
  compilerOptions: {
    rootDir: sourceFolderName,
    declarationDir: `${prodFolderName}/${typesFolderName}`,
    declarationMap: true,
    outDir: `${prodFolderName}/${sourceFolderName}`,
    allowJs: true,
    checkJs: true,
  },
} satisfies ReadonlyRecord;
