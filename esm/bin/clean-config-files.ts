/**
 * This binary cleans the configuration files of all packages in the active Project or of the active
 * Package if used with the -activePackageOnly flag (see README.md for the definition of a Project
 * and of a Package). The active Project is the one that contains the path from which this binary is
 * executed. The active Package is the one in whose root this binary is executed.
 */

import { rm } from 'fs/promises';
import { join } from 'path';
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
      const allConfigurationFiles = await Package.allConfigurationFiles(currentPackage);

      /* eslint-disable-next-line functional/no-expression-statements*/
      await Promise.all(
        allConfigurationFiles.map((relativeFilepath) =>
          rm(join(currentPackage.path, relativeFilepath), { force: true, recursive: true }),
        ),
      );
    } catch (e: unknown) {
      console.log(`Package '${currentPackage.name}': error rethrown`);
      throw e;
    }
  }),
);

console.log('SUCCESS');
