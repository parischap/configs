// This file must not import anything external
import { nonProjectMark, projectMark } from './constants.js';

/**
 * @import {ReadonlyRecord} from "./types.d.ts"
 */

/**
 * @type ReadonlyRecord
 */
export default {
  include: [],
  references: [
    { path: `./tsconfig.${projectMark}.json` },
    { path: `./tsconfig.${nonProjectMark}.json` },
  ],
};
