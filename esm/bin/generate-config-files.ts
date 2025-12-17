/**
 * This binary generates the configuration files of all packages in the active Project or of the
 * active Package if used with the -activePackageOnly flag (see README.md for the definition of a
 * Project and of a Package). The active Project is the one that contains the path from which this
 * binary is executed. The active Package is the one in whose root this binary is executed.
 *
 * Each Package, except the top package, must contain a `project.config.json` file that contains the
 * parameters of that package. The parameters of the top package are stored in Package.ts, so that
 * the top package does not need to be saved on github. Based on the parameters, this binary creates
 * a configuration object whose keys are the names of the files to create and values the contents of
 * these files.
 *
 * It then saves this configuration files and checks that no useless configuration files are present
 * in the package.
 *
 * Finally, it cleans all prod directories of all packages.
 */

/* This module must not import any external dependency. It must be runnable without a package.json because it is used at the very start of a project */

import * as PackageFiles from '../internal/bin-utils/ConfigFiles.js';
import * as Package from '../internal/bin-utils/Package/All.js';
import * as Project from '../internal/bin-utils/Project.js';
import { activePackageOnlyFlag } from '../internal/shared-utils/constants.js';
import { fromPosixPathToOSPath } from '../internal/shared-utils/utils.js';

const arg1 = process.argv[2];
const activePackageOnly = arg1 === activePackageOnlyFlag;

const project = await Project.make(activePackageOnly);

/* eslint-disable-next-line functional/no-expression-statements*/
await Promise.all(
  project.packages.map(async (currentPackage) => {
    try {
      const packageFiles = await Package.toPackageFiles(currentPackage);

      /* eslint-disable-next-line functional/no-expression-statements*/
      await PackageFiles.save(currentPackage.path)(packageFiles);

      const allConfigurationFiles = await Package.allConfigurationFiles(currentPackage);
      // In project.config.ts, paths are posix-Style. Let's convert them to OS style
      const filesToCreate = Object.keys(packageFiles.configurationFiles).map(fromPosixPathToOSPath);
      const unexpectedConfigFiles = allConfigurationFiles.filter(
        (relativePath) => !filesToCreate.includes(relativePath),
      );
      for (const unexpectedConfigFile of unexpectedConfigFiles)
        console.log(
          `Package '${currentPackage.name}': unexpected file '${unexpectedConfigFile}' was found`,
        );

      /* Remove prod directories because the packages will need rebuilding and these directories might contain conflicting versions of imported packages. We do it also in packages with no source, just in case... */
      /* eslint-disable-next-line functional/no-expression-statements*/
      await Package.cleanProd(currentPackage);
    } catch (e: unknown) {
      console.log(`Package '${currentPackage.name}': error rethrown`);
      throw e;
    }
  }),
);

console.log('SUCCESS');
