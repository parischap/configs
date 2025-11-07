// This module must not import any external dependency. It must be runnable without a package.json
import { nonProjectMark, projectMark } from '../constants.js';

import type { ReadonlyRecord } from '../types.js';

const _default: ReadonlyRecord = {
  include: [],
  references: [
    { path: `./tsconfig.${projectMark}.json` },
    { path: `./tsconfig.${nonProjectMark}.json` },
  ],
};

export default _default;
