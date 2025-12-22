/**
 * This binary cleans the configuration files of all packages in the active Project or of the active
 * Package if used with the -activePackageOnly flag (see README.md for the definition of a Project
 * and of a Package). The active Project is the one that contains the path from which this binary is
 * executed. The active Package is the one in whose root this binary is executed.
 */

import { join } from 'path';
import { activePackageOnlyFlag, indexTsFilename, sourceFolderName } from '../constants.js';
import * as PackageAll from '../internal/bin-utils/Package/All.js';
import * as PackageBase from '../internal/bin-utils/Package/Base.js';
import * as Project from '../internal/bin-utils/Project.js';
import { getExeFlags } from '../internal/shared-utils/utils.js';

console.log('Removing all configuration files');
const [activePackageOnly] = getExeFlags([activePackageOnlyFlag] as const);

const project = await Project.makeFilteredAndShowCount(
  activePackageOnly ? PackageBase.isActive : () => true,
);

/* eslint-disable-next-line functional/no-expression-statements*/
await Promise.all(
  project.packages.map(async (currentPackage) => {
    try {
      const configurationFiles = await PackageBase.getPathsOfExistingConfigFiles(currentPackage);
      const configurationFilesWithIndex =
        PackageAll.isSourcePackage(currentPackage) && currentPackage.packagePrefix !== undefined ?
          [...configurationFiles, join(sourceFolderName, indexTsFilename)]
        : configurationFiles;

      /* eslint-disable-next-line functional/no-expression-statements*/
      await Promise.all(
        configurationFilesWithIndex.map((relativePath) =>
          PackageBase.rmAndLogIfSuccessful(relativePath)(currentPackage),
        ),
      );
    } catch (e: unknown) {
      console.log(`Package '${currentPackage.name}': error rethrown`);
      throw e;
    }
  }),
);

console.log('SUCCESS');
