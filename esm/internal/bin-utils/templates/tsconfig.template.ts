import {
  tsConfigExamplesFilename,
  tsConfigOthersFilename,
  tsConfigSrcFilename,
  tsConfigTestsFilename,
} from '../../shared-utils/constants.js';
import { ReadonlyRecord } from '../../shared-utils/utils.js';

/* General tsconfig.json file. It references four sub-projects, each with its own environments (node available or not):
- the source sub-project where the package modules are located.
- the examples sub-project where example modules are located. The examples sub-project will usually use the node environment. Even if the examples sub-project has the exact same configuration as the source sub-project, they must be seperated because building the source project can always be necessary.
- the tests sub-project where test modules are located. The tests sub-project will usually use the node environment. Even if the tests sub-project has the exact same configuration as the source sub-project, they must be seperated because building the source project can always be necessary.
- the others sub-project which covers all configuration modules (eslint.config.ts, prettier.config.ts, vitest.config.ts,...). The others sub-project uses the node environment.
*/
export default {
  include: [],
  references: [
    { path: tsConfigSrcFilename },
    { path: tsConfigExamplesFilename },
    { path: tsConfigTestsFilename },
    { path: tsConfigOthersFilename },
  ],
} satisfies ReadonlyRecord;
