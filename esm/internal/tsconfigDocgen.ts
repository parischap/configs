// This module must not import any external dependency. It must be runnable without a package.json
import { allFiles, projectFolderName } from '../constants.js';
import type { ReadonlyRecord } from '../types.js';

export default {
  extends: './tsconfig.base.json',
  include: `${projectFolderName}/${allFiles}`,
  compilerOptions: {
    noEmit: true,
    lib: ['ESNext'],
    types: ['node'],
    allowJs: false,
    checkJs: false,
  },
} satisfies ReadonlyRecord;
