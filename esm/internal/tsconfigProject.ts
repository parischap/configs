// This module must not import any external dependency. It must be runnable without a package.json
import { allFiles, prodFolderName, projectFolderName, typesFolderName } from '../constants.js';
import type { ReadonlyRecord } from '../types.js';

export default {
  extends: './tsconfig.base.json',
  include: [`${projectFolderName}/${allFiles}`],
  compilerOptions: {
    rootDir: projectFolderName,
    declarationDir: `${prodFolderName}/${typesFolderName}`,
    declarationMap: true,
    outDir: `${prodFolderName}/${projectFolderName}`,
    allowJs: true,
    checkJs: true,
  },
} satisfies ReadonlyRecord;
