// This file must not import anything external
import { allFiles, projectFolderName } from './constants.js';
/**
 * @import {ReadonlyRecord} from "./types.d.ts"
 */

/**
 * @type ReadonlyRecord
 */
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
};
