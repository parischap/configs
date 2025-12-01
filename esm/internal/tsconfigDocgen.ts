// This module must not import any external dependency. It must be runnable without a package.json
import { allFilesPattern, sourceFolderName } from '../constants.js';
import type { ReadonlyRecord } from '../types.js';

export default {
  extends: './tsconfig.base.json',
  include: `${sourceFolderName}/${allFilesPattern}`,
  compilerOptions: {
    allowJs: false,
    checkJs: false,
  },
} satisfies ReadonlyRecord;
