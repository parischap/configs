// This file must not import anything external
import tsConfigEsm from './tsconfigEsm.js';
import { deepMerge } from './utils.js';
/**
 * @import {ReadonlyRecord} from "./types.d.ts"
 */

/**
 * @type ReadonlyRecord
 */
export default deepMerge(tsConfigEsm, {
  compilerOptions: {
    lib: ['ESNext'],
    types: ['node'],
  },
});
