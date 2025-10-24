// Whatever external package this file uses must be added as peerDependency
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
