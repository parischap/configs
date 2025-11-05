// This module must not import any external dependency. It must be runnable without a package.json
import { deepMerge } from '../utils.js';
import tsConfigProject from './tsconfigProject.js';
/** @import {ReadonlyRecord} from "../types.js" */

/** @type ReadonlyRecord */
export default deepMerge(tsConfigProject, {
  compilerOptions: {
    lib: ['ESNext'],
    types: ['node'],
  },
});
