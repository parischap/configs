// This module must not import any external dependency. It must be runnable without a package.json
import type { ReadonlyRecord } from '../types.js';
import { deepMerge } from '../utils.js';
import tsConfigSrc from './tsconfigSrc.js';

export default deepMerge(tsConfigSrc, {
  compilerOptions: {
    types: [],
  },
}) satisfies ReadonlyRecord;
