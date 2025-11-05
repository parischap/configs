// This module must not import any external dependency. It must be runnable without a package.json
import { nonProjectMark, projectMark } from '../constants.js';

/** @import {ReadonlyRecord} from "../types.js" */

/** @type ReadonlyRecord */
export default {
  include: [],
  references: [
    { path: `./tsconfig.${projectMark}.json` },
    { path: `./tsconfig.${nonProjectMark}.json` },
  ],
};
