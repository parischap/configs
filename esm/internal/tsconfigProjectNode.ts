// This module must not import any external dependency. It must be runnable without a package.json
import type { ReadonlyRecord } from '../types.js';
import { deepMerge } from '../utils.js';
import tsConfigProject from './tsconfigProject.js';

const _default: ReadonlyRecord = deepMerge(tsConfigProject, {
  compilerOptions: {
    lib: ['ESNext'],
    types: ['node'],
  },
});

export default _default;
