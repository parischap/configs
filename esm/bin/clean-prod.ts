/**
 * This binary cleans the prod folders (dist/ and .tsbuildinfo/) of all packages in the active
 * Project or of the active Package if used with the -activePackageOnly flag (see README.md for the
 * definition of a Project and of a Package). The active Project is the one that contains the path
 * from which this binary is executed. The active Package is the one in whose root this binary is
 * executed.
 */

import * as Package from '../internal/bin-utils/Package/All.js';
import * as Project from '../internal/bin-utils/Project.js';
import { activePackageOnlyFlag } from '../internal/shared-utils/constants.js';

const arg1 = process.argv[2];
const activePackageOnly = arg1 === activePackageOnlyFlag;

const project = await Project.make(activePackageOnly);

/* eslint-disable-next-line functional/no-expression-statements*/
await Promise.all(
  project.packages.map(async (currentPackage) => {
    try {
      /* eslint-disable-next-line functional/no-expression-statements*/
      await Package.cleanProd(currentPackage);
    } catch (e: unknown) {
      console.log(`Package '${currentPackage.name}': error rethrown`);
      throw e;
    }
  }),
);

console.log('SUCCESS');
