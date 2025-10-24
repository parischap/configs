// Whatever external package this file uses must be added as peerDependency
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
