/**
 * Specific tsconfig used by docgen. Some examples can be provided as jsdoc comments and these
 * examples usually require the node environment
 */
import {
  allFilesPattern,
  sourceFolderName,
  tsConfigBaseFilename,
} from '../../shared-utils/constants.js';
import { type ReadonlyRecord } from '../../shared-utils/utils.js';

export default {
  extends: [`./${tsConfigBaseFilename}`],
  include: `${sourceFolderName}/${allFilesPattern}`,
  compilerOptions: {
    allowJs: false,
    checkJs: false,
  },
} satisfies ReadonlyRecord;
