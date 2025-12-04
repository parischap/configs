// This module must not import any external dependency. It must be runnable without a package.json
import {
  tsConfigExamplesFilename,
  tsConfigOthersFilename,
  tsConfigSrcFilename,
  tsConfigTestsFilename,
} from '../shared-utils/constants.js';
import type { ReadonlyRecord } from '../shared-utils/types.js';

export default {
  include: [],
  references: [
    { path: tsConfigSrcFilename },
    { path: tsConfigExamplesFilename },
    { path: tsConfigTestsFilename },
    { path: tsConfigOthersFilename },
  ],
} satisfies ReadonlyRecord;
