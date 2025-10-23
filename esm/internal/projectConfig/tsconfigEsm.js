// This file must not import anything external
import { allFiles, prodFolderName, projectFolderName, typesFolderName } from './constants.js';
/**
 * @import {ReadonlyRecord} from "./types.d.ts"
 */

/**
 * @type ReadonlyRecord
 */
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
};
