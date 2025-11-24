// This module must not import any external dependency. It must be runnable without a package.json
import type { ReadonlyRecord } from '../types.js';
import { deepMerge } from '../utils.js';
import tsConfigProject from './tsconfigProject.js';

export default deepMerge(tsConfigProject, {
  compilerOptions: {
    lib: ['ESNext'],
    types: ['node'],
  },
}) satisfies ReadonlyRecord;
