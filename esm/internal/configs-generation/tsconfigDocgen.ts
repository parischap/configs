// This module must not import any external dependency. It must be runnable without a package.json
import { allFilesPattern, sourceFolderName } from '../shared-utils/constants.js';
import type { ReadonlyRecord } from '../shared-utils/types.js';

export default {
  extends: './tsconfig.base.json',
  include: `${sourceFolderName}/${allFilesPattern}`,
  compilerOptions: {
    allowJs: false,
    checkJs: false,
  },
} satisfies ReadonlyRecord;
