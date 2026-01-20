import { allJavaScriptFilesInSource } from '../../shared-utils/constants.js';
import { type ReadonlyRecord, deepMerge2 } from '../../shared-utils/utils.js';

import OxlintRcPlain from './OxlintrcPlain.js';

export default deepMerge2(OxlintRcPlain, {
  overrides: [
    {
      env: { node: true },
      files: [allJavaScriptFilesInSource],
    },
  ],
}) satisfies ReadonlyRecord;
